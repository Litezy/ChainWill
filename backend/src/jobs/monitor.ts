import cron from 'node-cron';
import { parseAbi } from 'viem';
import { prisma } from '../config/db';
import { CHAINWILL_ABI } from '../config/abi';
import { viemClient } from '../config/web3';
import { alertDispatcher } from '../services/alertDispatcher';

const chainWillAbi = parseAbi(CHAINWILL_ABI);

type ActiveWillRecord = Awaited<
  ReturnType<typeof prisma.will.findMany>
>[number];

export class InactivityMonitorJob {
  private task: ReturnType<typeof cron.schedule> | null = null;
  private isRunning = false;
  private readonly schedule = '* * * * *';
  private readonly maxParallelChecks = parseInt(
    process.env.MONITOR_MAX_PARALLEL_CHECKS || '5',
    10
  );

  async start(): Promise<void> {
    if (this.task) {
      console.warn('[InactivityMonitor] Monitor already running');
      return;
    }

    console.log(
      `[InactivityMonitor] Starting monitor with schedule ${this.schedule}`
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

  private async runCycle(): Promise<void> {
    if (this.isRunning) {
      console.warn('[InactivityMonitor] Previous cycle still running, skipping');
      return;
    }

    this.isRunning = true;

    try {
      const wills = await prisma.will.findMany({
        where: {
          isLocked: false,
        },
        include: {
          signers: true,
        },
      });

      if (wills.length === 0) {
        return;
      }

      console.log(`[InactivityMonitor] Checking ${wills.length} active wills`);

      for (let i = 0; i < wills.length; i += this.maxParallelChecks) {
        const batch = wills.slice(i, i + this.maxParallelChecks);
        await Promise.all(batch.map((will) => this.processWill(will)));
      }
    } catch (error) {
      console.error('[InactivityMonitor] Monitor cycle failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  private async processWill(will: ActiveWillRecord): Promise<void> {
    try {
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
        attestationAlertSentAt?: Date | null;
        fundingRiskAlertSentAt?: Date | null;
      } = {};

      if (will.attestationOpen !== attestationOpen) {
        updateData.attestationOpen = attestationOpen;
      }

      if (!attestationOpen && will.attestationAlertSentAt) {
        updateData.attestationAlertSentAt = null;
      }

      if (attestationOpen && !will.attestationAlertSentAt) {
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

        await alertDispatcher.sendAttestationOpenAlert({
          willId: will.id,
          contractAddress: will.contractAddress,
          recipients,
        });

        updateData.attestationAlertSentAt = new Date();
      }

      if (fundingReasons.length === 0 && will.fundingRiskAlertSentAt) {
        updateData.fundingRiskAlertSentAt = null;
      }

      if (fundingReasons.length > 0 && !will.fundingRiskAlertSentAt) {
        const ownerEmail = alertDispatcher.resolveRecipientEmail({
          address: will.ownerAddress,
          email: will.ownerEmail,
        });

        await alertDispatcher.sendFundingRiskAlert({
          willId: will.id,
          contractAddress: will.contractAddress,
          recipient: ownerEmail ? [ownerEmail] : [],
          approvedAmount: will.approvedAmount,
          ownerBalance: ownerBalanceString,
          reasons: fundingReasons,
        });

        updateData.fundingRiskAlertSentAt = new Date();
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.will.update({
          where: { id: will.id },
          data: updateData,
        });
      }
    } catch (error) {
      console.error(
        `[InactivityMonitor] Failed to process will ${will.id}:`,
        error instanceof Error ? error.message : error
      );
    }
  }
}

export const inactivityMonitorJob = new InactivityMonitorJob();
