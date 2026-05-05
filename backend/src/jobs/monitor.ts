import type { Prisma } from '@prisma/client';
import cron from 'node-cron';
import { parseAbi } from 'viem';
import { prisma } from '../config/db';
import { CHAINWILL_ABI } from '../config/abi';
import {
  assertAdminRelayerConfigured,
  getAdminRelayerStatus,
  viemClient,
} from '../config/web3';
import { notificationQueue } from '../queues/notificationQueue';
import { alertDispatcher } from '../services/alertDispatcher';

const chainWillAbi = parseAbi(CHAINWILL_ABI);

type ActiveWillRecord = Prisma.WillGetPayload<{
  include: {
    signers: true;
  };
}>;

export class InactivityMonitorJob {
  private task: ReturnType<typeof cron.schedule> | null = null;
  private isRunning = false;
  private lastCompletedAt: Date | null = null;
  private readonly schedule = '* * * * *';
  private readonly maxParallelChecks = parseInt(
    process.env.MONITOR_MAX_PARALLEL_CHECKS || '5',
    10
  );
  private readonly maxParallelTriggers = parseInt(
    process.env.RELAYER_MAX_PARALLEL_TXS || '2',
    10
  );
  private readonly gasBufferBps = parseInt(
    process.env.RELAYER_GAS_BUFFER_BPS || '500',
    10
  );

  async start(): Promise<void> {
    if (this.task) {
      console.warn('[InactivityMonitor] Monitor already running');
      return;
    }

    const relayerStatus = getAdminRelayerStatus();
    if (relayerStatus.error) {
      throw new Error(
        `[InactivityMonitor] Relayer configuration invalid: ${relayerStatus.error}`
      );
    }

    if (!relayerStatus.configured) {
      throw new Error(
        '[InactivityMonitor] ADMIN_PRIVATE_KEY must be configured for the mandatory admin relayer'
      );
    }

    console.log(
      `[InactivityMonitor] Starting monitor with schedule ${this.schedule}`
    );
    console.log(
      `[InactivityMonitor] Admin relayer configured for ${relayerStatus.address}`
    );

    await this.runCycle();

    this.task = cron.schedule(this.schedule, () => {
      void this.runCycle();
    });
  }

  stop(): void {
    if (!this.task) {
      return;
    }

    this.task.stop();
    this.task = null;
    console.log('[InactivityMonitor] Monitor stopped');
  }

  isHealthy(): boolean {
    return this.task !== null;
  }

  getStatus(): {
    running: boolean;
    configured: boolean;
    relayerAddress: `0x${string}` | null;
    lastCompletedAt: string | null;
  } {
    const relayerStatus = getAdminRelayerStatus();

    return {
      running: this.task !== null,
      configured: relayerStatus.configured && !relayerStatus.error,
      relayerAddress: relayerStatus.address,
      lastCompletedAt: this.lastCompletedAt?.toISOString() ?? null,
    };
  }

  private async runCycle(): Promise<void> {
    if (this.isRunning) {
      console.warn('[InactivityMonitor] Previous cycle still running, skipping');
      return;
    }

    this.isRunning = true;

    try {
      const [triggerableWillIds, wills] = await Promise.all([
        this.getTriggerableWillIds(),
        prisma.will.findMany({
          where: {
            isLocked: false,
          },
          include: {
            signers: true,
          },
        }),
      ]);

      if (wills.length === 0) {
        this.lastCompletedAt = new Date();
        return;
      }

      const triggerableWillIdSet = new Set(triggerableWillIds);

      if (triggerableWillIdSet.size > 0) {
        console.log(
          `[InactivityMonitor] Found ${triggerableWillIdSet.size} wills eligible for admin trigger`
        );
      }

      console.log(`[InactivityMonitor] Checking ${wills.length} active wills`);

      for (let i = 0; i < wills.length; i += this.maxParallelChecks) {
        const batch = wills.slice(i, i + this.maxParallelChecks);
        const batchTriggerableWillIds = batch
          .filter((will) => triggerableWillIdSet.has(will.id))
          .map((will) => will.id);

        for (
          let triggerIndex = 0;
          triggerIndex < batchTriggerableWillIds.length;
          triggerIndex += this.maxParallelTriggers
        ) {
          const triggerIdBatch = new Set(
            batchTriggerableWillIds.slice(
              triggerIndex,
              triggerIndex + this.maxParallelTriggers
            )
          );

          await Promise.all(
            batch
              .filter((will) => triggerIdBatch.has(will.id))
              .map((will) => this.processWill(will, true))
          );
        }

        await Promise.all(
          batch
            .filter((will) => !triggerableWillIdSet.has(will.id))
            .map((will) => this.processWill(will, false))
        );
      }

      this.lastCompletedAt = new Date();
    } catch (error) {
      console.error('[InactivityMonitor] Monitor cycle failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  private async getTriggerableWillIds(): Promise<string[]> {
    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "Will"
      WHERE "attestationOpen" = false
        AND "isLocked" = false
        AND "isTriggered" = false
        AND NOW() >= "lastCheckIn"
          + (("inactivityPeriod" + "gracePeriod") * interval '1 second')
    `;

    return rows.map((row) => row.id);
  }

  private async processWill(
    will: ActiveWillRecord,
    shouldAttemptTrigger: boolean
  ): Promise<void> {
    try {
      let { attestationOpen, ownerBalance } = await this.readOnChainState(will);

      if (shouldAttemptTrigger && !attestationOpen) {
        const triggerAttempted = await this.triggerAttestationWindow(will);

        if (triggerAttempted) {
          const refreshedState = await this.readOnChainState(will);
          attestationOpen = refreshedState.attestationOpen;
          ownerBalance = refreshedState.ownerBalance;
        }
      }

      await this.syncWillState(will, attestationOpen, ownerBalance);
    } catch (error) {
      console.error(
        `[InactivityMonitor] Failed to process will ${will.id}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  private async readOnChainState(
    will: ActiveWillRecord
  ): Promise<{ attestationOpen: boolean; ownerBalance: bigint }> {
    const [attestationStatus, ownerBalance] = await Promise.all([
      viemClient.readContract({
        address: will.contractAddress as `0x${string}`,
        abi: chainWillAbi,
        functionName: 'getAttestationStatus',
      }),
      viemClient.readContract({
        address: will.contractAddress as `0x${string}`,
        abi: chainWillAbi,
        functionName: 'getOwnerBalance',
      }),
    ]);

    const [attestationOpen] = attestationStatus;

    return {
      attestationOpen,
      ownerBalance,
    };
  }

  private async triggerAttestationWindow(
    will: ActiveWillRecord
  ): Promise<boolean> {
    const { account, walletClient } = assertAdminRelayerConfigured();

    try {
      const estimatedGas = await viemClient.estimateContractGas({
        account,
        address: will.contractAddress as `0x${string}`,
        abi: chainWillAbi,
        functionName: 'triggerByTime',
      });

      const transactionHash = await walletClient.writeContract({
        account,
        chain: undefined,
        address: will.contractAddress as `0x${string}`,
        abi: chainWillAbi,
        functionName: 'triggerByTime',
        gas: this.withGasBuffer(estimatedGas),
        ...(await this.getFeeConfiguration()),
      });

      const receipt = await viemClient.waitForTransactionReceipt({
        hash: transactionHash,
      });

      if (receipt.status !== 'success') {
        throw new Error(
          `triggerByTime transaction reverted: ${transactionHash}`
        );
      }

      await prisma.eventLog
        .create({
          data: {
            willAddress: will.contractAddress.toLowerCase(),
            eventName: 'InactivityTriggered',
            txHash: transactionHash,
            blockNumber: Number(receipt.blockNumber),
            data: {
              triggeredBy: account.address,
              relayer: 'admin-cron',
            },
          },
        })
        .catch((error: { code?: string }) => {
          if (error.code !== 'P2002') {
            throw error;
          }
        });

      console.log(
        `[InactivityMonitor] Opened attestation window for will ${will.id} (${transactionHash})`
      );

      return true;
    } catch (error) {
      console.error(
        `[InactivityMonitor] Failed to call triggerByTime for will ${will.id}:`,
        error instanceof Error ? error.message : error
      );
      return false;
    }
  }

  private async getFeeConfiguration(): Promise<
    | {
        gasPrice: bigint;
      }
    | {
        maxFeePerGas: bigint;
        maxPriorityFeePerGas: bigint;
      }
    | {}
  > {
    try {
      const fees = await viemClient.estimateFeesPerGas();

      if (
        typeof fees.maxFeePerGas === 'bigint' &&
        typeof fees.maxPriorityFeePerGas === 'bigint'
      ) {
        return {
          maxFeePerGas: fees.maxFeePerGas,
          maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
        };
      }

      if (typeof fees.gasPrice === 'bigint') {
        return {
          gasPrice: fees.gasPrice,
        };
      }
    } catch (error) {
      console.warn(
        '[InactivityMonitor] Failed to estimate EIP-1559 fees, falling back to gasPrice:',
        error instanceof Error ? error.message : error
      );
    }

    try {
      return {
        gasPrice: await viemClient.getGasPrice(),
      };
    } catch (error) {
      console.warn(
        '[InactivityMonitor] Failed to fetch gasPrice for relayer transaction:',
        error instanceof Error ? error.message : error
      );
      return {};
    }
  }

  private withGasBuffer(estimatedGas: bigint): bigint {
    const boundedBufferBps = Math.min(Math.max(this.gasBufferBps, 0), 1_000);
    const buffer = (estimatedGas * BigInt(boundedBufferBps)) / 10_000n;
    return estimatedGas + buffer;
  }

  private async syncWillState(
    will: ActiveWillRecord,
    attestationOpen: boolean,
    ownerBalance: bigint
  ): Promise<void> {
    const approvedAmount = BigInt(will.approvedAmount);
    const ownerBalanceString = ownerBalance.toString();
    const fundingReasons: string[] = [];

    if (approvedAmount === 0n) {
      fundingReasons.push('approvedAmount is 0');
    }

    if (ownerBalance < approvedAmount) {
      fundingReasons.push('owner balance is below approvedAmount');
    }

    const updateData: {
      attestationOpen?: boolean;
      attestationAlertEnqueuedAt?: Date | null;
      attestationAlertSentAt?: Date | null;
      fundingRiskAlertEnqueuedAt?: Date | null;
      fundingRiskAlertSentAt?: Date | null;
    } = {};

    if (will.attestationOpen !== attestationOpen) {
      updateData.attestationOpen = attestationOpen;
    }

    if (!attestationOpen && will.attestationAlertSentAt) {
      updateData.attestationAlertSentAt = null;
    }

    if (!attestationOpen && will.attestationAlertEnqueuedAt) {
      updateData.attestationAlertEnqueuedAt = null;
    }

    if (
      attestationOpen &&
      !will.attestationAlertSentAt &&
      !will.attestationAlertEnqueuedAt
    ) {
      const recipients = Array.from(
        new Set(
          will.signers
            .map((signer) =>
              alertDispatcher.resolveRecipientEmail({
                address: signer.signerAddress,
                email: signer.signerEmail,
              })
            )
            .filter((email): email is string => Boolean(email))
        )
      );

      await notificationQueue.enqueue({
        type: 'attestation-open',
        willId: will.id,
        contractAddress: will.contractAddress,
        recipients,
      });

      updateData.attestationAlertEnqueuedAt = new Date();
    }

    if (fundingReasons.length === 0 && will.fundingRiskAlertSentAt) {
      updateData.fundingRiskAlertSentAt = null;
    }

    if (fundingReasons.length === 0 && will.fundingRiskAlertEnqueuedAt) {
      updateData.fundingRiskAlertEnqueuedAt = null;
    }

    if (
      fundingReasons.length > 0 &&
      !will.fundingRiskAlertSentAt &&
      !will.fundingRiskAlertEnqueuedAt
    ) {
      const ownerEmail = alertDispatcher.resolveRecipientEmail({
        address: will.ownerAddress,
        email: will.ownerEmail,
      });

      await notificationQueue.enqueue({
        type: 'funding-risk',
        willId: will.id,
        contractAddress: will.contractAddress,
        recipients: ownerEmail ? [ownerEmail] : [],
        approvedAmount: will.approvedAmount,
        ownerBalance: ownerBalanceString,
        reasons: fundingReasons,
      });

      updateData.fundingRiskAlertEnqueuedAt = new Date();
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.will.update({
        where: { id: will.id },
        data: updateData,
      });
    }
  }
}

export const inactivityMonitorJob = new InactivityMonitorJob();
