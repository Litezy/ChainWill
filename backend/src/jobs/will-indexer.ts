import { getAbiItem } from 'viem';
import { prisma } from '../config/db';
import { CHAINWILL_PARSED_ABI } from '../config/abi';
import { viemClient } from '../config/web3';

type ChildWillEventName =
  | 'CheckIn'
  | 'InactivityTriggered'
  | 'WillLocked'
  | 'BeneficiaryAdded'
  | 'BeneficiaryRemoved'
  | 'BeneficiaryUpdated'
  | 'BeneficiaryAddressUpdated'
  | 'SignerAttested'
  | 'AttestationRevoked'
  | 'SignerReplaced'
  | 'GracePeriodUpdated'
  | 'InactivityPeriodUpdated';

const CHILD_WILL_EVENTS: ChildWillEventName[] = [
  'CheckIn',
  'InactivityTriggered',
  'WillLocked',
  'BeneficiaryAdded',
  'BeneficiaryRemoved',
  'BeneficiaryUpdated',
  'BeneficiaryAddressUpdated',
  'SignerAttested',
  'AttestationRevoked',
  'SignerReplaced',
  'GracePeriodUpdated',
  'InactivityPeriodUpdated',
];

export class WillIndexer {
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private lastProcessedBlock = 0;
  private readonly pollIntervalMs = parseInt(process.env.WILL_POLL_INTERVAL || '30000', 10);
  private readonly lookbackBlocks = parseInt(process.env.WILL_LOOKBACK_BLOCKS || '100', 10);

  async start(): Promise<void> {
    if (this.pollInterval) {
      console.warn('[WillIndexer] Already running');
      return;
    }

    const currentBlock = await viemClient.getBlockNumber();
    this.lastProcessedBlock = Math.max(Number(currentBlock) - this.lookbackBlocks, 0);

    console.log(`[WillIndexer] Listening to child wills from block ${this.lastProcessedBlock}`);

    await this.pollEvents();
    this.pollInterval = setInterval(() => {
      this.pollEvents().catch((error) => {
        console.error('[WillIndexer] Poll failed:', error);
      });
    }, this.pollIntervalMs);
  }

  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
      console.log('[WillIndexer] Stopped');
    }
  }

  private async pollEvents(): Promise<void> {
    const wills = await prisma.will.findMany({
      select: { contractAddress: true },
    });
    const addresses = wills.map((will) => will.contractAddress as `0x${string}`);

    if (addresses.length === 0) {
      return;
    }

    const currentBlock = await viemClient.getBlockNumber();
    const toBlock = Number(currentBlock);

    if (toBlock <= this.lastProcessedBlock) {
      return;
    }

    for (const eventName of CHILD_WILL_EVENTS) {
      const logs = (await viemClient.getLogs({
        address: addresses,
        event: getAbiItem({ abi: CHAINWILL_PARSED_ABI, name: eventName }),
        fromBlock: BigInt(this.lastProcessedBlock + 1),
        toBlock: BigInt(toBlock),
      } as any)) as Array<{
        address: `0x${string}`;
        args?: Record<string, unknown>;
        blockNumber: bigint;
        transactionHash: `0x${string}`;
      }>;

      for (const log of logs) {
        await this.processChildWillEvent({
          eventName,
          willAddress: log.address.toLowerCase(),
          args: log.args || {},
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
        });
      }
    }

    this.lastProcessedBlock = toBlock;
  }

  private async processChildWillEvent(log: {
    eventName: ChildWillEventName;
    willAddress: string;
    args: Record<string, unknown>;
    blockNumber: bigint;
    transactionHash: `0x${string}`;
  }): Promise<void> {
    const existingEvent = await prisma.eventLog.findUnique({
      where: { txHash: log.transactionHash },
    });
    if (existingEvent) {
      return;
    }

    const will = await prisma.will.findUnique({
      where: { contractAddress: log.willAddress },
      select: { id: true },
    });
    if (!will) {
      console.warn(`[WillIndexer] No DB will found for ${log.willAddress}`);
      return;
    }

    const block = await viemClient.getBlock({ blockNumber: log.blockNumber });
    const blockTimestamp = new Date(Number(block.timestamp) * 1000);

    await prisma.$transaction(async (tx) => {
      switch (log.eventName) {
        case 'CheckIn':
          await tx.will.update({
            where: { id: will.id },
            data: {
              lastCheckIn: this.bigIntTimestampToDate(log.args.timestamp, blockTimestamp),
              attestationOpen: false,
            },
          });
          break;

        case 'InactivityTriggered':
          await tx.will.update({
            where: { id: will.id },
            data: {
              attestationOpen: true,
              triggeredAt: this.bigIntTimestampToDate(log.args.triggeredAt, blockTimestamp),
            },
          });
          break;

        case 'WillLocked':
          await tx.will.update({
            where: { id: will.id },
            data: {
              isTriggered: true,
              isLocked: true,
              attestationOpen: false,
              triggeredAt: this.bigIntTimestampToDate(log.args.timestamp, blockTimestamp),
              finalPool: this.bigIntToString(log.args.finalPool),
              feePaid: this.bigIntToString(log.args.fee),
            },
          });
          break;

        case 'BeneficiaryAdded':
        case 'BeneficiaryUpdated':
          await tx.beneficiary.upsert({
            where: {
              willId_beneficiaryId: {
                willId: will.id,
                beneficiaryId: this.bigIntToNumber(log.args.id),
              },
            },
            update: {
              walletAddress: this.addressArg(log.args.wallet),
              percent: this.bigIntToNumber(
                log.eventName === 'BeneficiaryUpdated' ? log.args.newPercent : log.args.percent
              ),
            },
            create: {
              willId: will.id,
              beneficiaryId: this.bigIntToNumber(log.args.id),
              walletAddress: this.addressArg(log.args.wallet),
              percent: this.bigIntToNumber(
                log.eventName === 'BeneficiaryUpdated' ? log.args.newPercent : log.args.percent
              ),
            },
          });
          break;

        case 'BeneficiaryRemoved':
          await tx.beneficiary.deleteMany({
            where: {
              willId: will.id,
              beneficiaryId: this.bigIntToNumber(log.args.id),
            },
          });
          break;

        case 'BeneficiaryAddressUpdated':
          await tx.beneficiary.updateMany({
            where: {
              willId: will.id,
              beneficiaryId: this.bigIntToNumber(log.args.id),
              walletAddress: this.addressArg(log.args.oldWallet),
            },
            data: {
              walletAddress: this.addressArg(log.args.newWallet),
            },
          });
          break;

        case 'SignerAttested':
          await tx.signer.updateMany({
            where: {
              willId: will.id,
              signerAddress: this.addressArg(log.args.signer),
              replacedAt: null,
            },
            data: { hasSigned: true },
          });
          break;

        case 'AttestationRevoked':
          await tx.signer.updateMany({
            where: {
              willId: will.id,
              signerAddress: this.addressArg(log.args.signer),
              replacedAt: null,
            },
            data: { hasSigned: false },
          });
          break;

        case 'SignerReplaced':
          await tx.signer.updateMany({
            where: {
              willId: will.id,
              signerAddress: this.addressArg(log.args.oldSigner),
              replacedAt: null,
            },
            data: {
              hasSigned: false,
              replacedAt: blockTimestamp,
            },
          });
          await tx.signer.create({
            data: {
              willId: will.id,
              signerAddress: this.addressArg(log.args.newSigner),
              hasSigned: false,
            },
          });
          break;

        case 'GracePeriodUpdated':
          await tx.will.update({
            where: { id: will.id },
            data: { gracePeriod: this.bigIntToNumber(log.args.newPeriod) },
          });
          break;

        case 'InactivityPeriodUpdated':
          await tx.will.update({
            where: { id: will.id },
            data: { inactivityPeriod: this.bigIntToNumber(log.args.newPeriod) },
          });
          break;
      }

      await tx.eventLog.create({
        data: {
          willAddress: log.willAddress,
          eventName: log.eventName,
          txHash: log.transactionHash,
          blockNumber: Number(log.blockNumber),
          timestamp: blockTimestamp,
          data: this.serializeArgs(log.args),
        },
      });
    });

    console.log(`[WillIndexer] Indexed ${log.eventName} for ${log.willAddress}`);
  }

  private addressArg(value: unknown): string {
    if (typeof value !== 'string') {
      throw new Error('Expected address event arg');
    }

    return value.toLowerCase();
  }

  private bigIntToString(value: unknown): string {
    return typeof value === 'bigint' ? value.toString() : String(value ?? '0');
  }

  private bigIntToNumber(value: unknown): number {
    return Number(typeof value === 'bigint' ? value : BigInt(String(value ?? 0)));
  }

  private bigIntTimestampToDate(value: unknown, fallback: Date): Date {
    if (value === undefined || value === null) {
      return fallback;
    }

    return new Date(this.bigIntToNumber(value) * 1000);
  }

  private serializeArgs(args: Record<string, unknown>): Record<string, string | number | boolean> {
    return Object.fromEntries(
      Object.entries(args).map(([key, value]) => [
        key,
        typeof value === 'bigint' ? value.toString() : (value as string | number | boolean),
      ])
    );
  }
}

export const willIndexer = new WillIndexer();
