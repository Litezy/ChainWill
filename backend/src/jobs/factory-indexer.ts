import { getAbiItem } from 'viem';
import { prisma } from '../config/db';
import { FACTORY_ADDRESS, FACTORY_PARSED_ABI, CHAINWILL_PARSED_ABI } from '../config/abi';
import { viemClient } from '../config/web3';

interface WillCreatedArgs {
  will?: `0x${string}`;
  owner?: `0x${string}`;
  token?: `0x${string}`;
}

export class FactoryIndexer {
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private lastProcessedBlock = 0;
  private readonly pollIntervalMs = parseInt(process.env.FACTORY_POLL_INTERVAL || '30000', 10);
  private readonly lookbackBlocks = parseInt(process.env.FACTORY_LOOKBACK_BLOCKS || '100', 10);
  private readonly defaultInactivityPeriod = parseInt(
    process.env.DEFAULT_INACTIVITY_PERIOD || '120',
    10
  );
  private readonly defaultGracePeriod = parseInt(process.env.DEFAULT_GRACE_PERIOD || '120', 10);

  async start(): Promise<void> {
    if (this.pollInterval) {
      console.warn('[FactoryIndexer] Already running');
      return;
    }

    const currentBlock = await viemClient.getBlockNumber();
    this.lastProcessedBlock = Math.max(Number(currentBlock) - this.lookbackBlocks, 0);

    console.log(
      `[FactoryIndexer] Listening to ${FACTORY_ADDRESS} from block ${this.lastProcessedBlock}`
    );

    await this.pollEvents();
    this.pollInterval = setInterval(() => {
      this.pollEvents().catch((error) => {
        console.error('[FactoryIndexer] Poll failed:', error);
      });
    }, this.pollIntervalMs);
  }

  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
      console.log('[FactoryIndexer] Stopped');
    }
  }

  private async pollEvents(): Promise<void> {
    const currentBlock = await viemClient.getBlockNumber();
    const toBlock = Number(currentBlock);

    if (toBlock <= this.lastProcessedBlock) {
      return;
    }

    const logs = await viemClient.getLogs({
      address: FACTORY_ADDRESS,
      event: getAbiItem({ abi: FACTORY_PARSED_ABI, name: 'WillCreated' }),
      fromBlock: BigInt(this.lastProcessedBlock + 1),
      toBlock: BigInt(toBlock),
    });

    for (const log of logs) {
      await this.processWillCreated(log as typeof log & { args?: WillCreatedArgs; logIndex: number });
    }

    this.lastProcessedBlock = toBlock;
  }

  private async processWillCreated(log: {
    args?: WillCreatedArgs;
    blockNumber: bigint;
    logIndex: number;
    transactionHash: `0x${string}`;
  }): Promise<void> {
    const willAddress = log.args?.will?.toLowerCase();
    const ownerAddress = log.args?.owner?.toLowerCase();
    const tokenAddress = log.args?.token?.toLowerCase();

    if (!willAddress || !ownerAddress || !tokenAddress) {
      console.warn('[FactoryIndexer] Skipping WillCreated log with missing args:', log);
      return;
    }

    const existingEvent = await prisma.eventLog.findUnique({
      where: {
        txHash_logIndex: {
          txHash: log.transactionHash,
          logIndex: log.logIndex,
        },
      },
    });
    if (existingEvent) {
      return;
    }

    const block = await viemClient.getBlock({ blockNumber: log.blockNumber });
    const blockTimestamp = new Date(Number(block.timestamp) * 1000);
    let signerAddresses: string[] = [];

    try {
      const signers = await viemClient.readContract({
        address: willAddress as `0x${string}`,
        abi: CHAINWILL_PARSED_ABI,
        functionName: 'getSigners',
      });
      signerAddresses = signers.map((signer) => signer.toLowerCase());
    } catch (error) {
      console.warn(
        `[FactoryIndexer] Could not read signers for ${willAddress}:`,
        error instanceof Error ? error.message : error
      );
    }

    await prisma.$transaction(async (tx) => {
      const will = await tx.will.upsert({
        where: { contractAddress: willAddress },
        update: {
          ownerAddress,
          tokenAddress,
          createdTxHash: log.transactionHash,
          lastCheckIn: blockTimestamp,
        },
        create: {
          contractAddress: willAddress,
          ownerAddress,
          tokenAddress,
          inactivityPeriod: this.defaultInactivityPeriod,
          gracePeriod: this.defaultGracePeriod,
          lastCheckIn: blockTimestamp,
          createdTxHash: log.transactionHash,
        },
      });

      if (signerAddresses.length > 0) {
        const existingSigners = await tx.signer.findMany({
          where: { willId: will.id },
          select: { signerAddress: true },
        });
        const existing = new Set(existingSigners.map((signer) => signer.signerAddress));
        const newSigners = signerAddresses.filter((signer) => !existing.has(signer));

        if (newSigners.length > 0) {
          await tx.signer.createMany({
            data: newSigners.map((signerAddress) => ({
              willId: will.id,
              signerAddress,
            })),
          });
        }
      }

      await tx.eventLog.create({
        data: {
          willAddress,
          eventName: 'WillCreated',
          txHash: log.transactionHash,
          logIndex: log.logIndex,
          blockNumber: Number(log.blockNumber),
          timestamp: blockTimestamp,
          data: {
            will: willAddress,
            owner: ownerAddress,
            token: tokenAddress,
          },
        },
      });
    });

    console.log(`[FactoryIndexer] Indexed will ${willAddress} for owner ${ownerAddress}`);
  }
}

export const factoryIndexer = new FactoryIndexer();
