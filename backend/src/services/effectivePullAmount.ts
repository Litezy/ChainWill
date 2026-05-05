import { viemClient } from '../config/web3';
import { prisma } from '../config/db';
import { CHAINWILL_PARSED_ABI } from '../config/abi';

// Minimal ABI for FundingModule to call getEffectivePullAmount
// Using the complete ChainWill ABI interface

/**
 * Service to periodically update effectivePullAmount for all wills.
 * 
 * Calls getEffectivePullAmount() on each will contract to get the minimum of
 * (approved amount, owner wallet balance) and updates the database.
 */
export class EffectivePullAmountService {
  private updateInterval: ReturnType<typeof setInterval> | null = null;
  private readonly UPDATE_INTERVAL_MS = parseInt(
    process.env.EFFECTIVE_AMOUNT_UPDATE_INTERVAL || '60000',
    10
  ); // 60s default
  private readonly MAX_PARALLEL_UPDATES = parseInt(
    process.env.MAX_PARALLEL_UPDATES || '5',
    10
  ); // Prevent RPC overload

  /**
   * Start the service
   */
  async start(): Promise<void> {
    console.log('[EffectivePullAmount] Starting effective pull amount updater...');

    try {
      // Run once immediately
      await this.updateAllWills();

      // Then set up periodic updates
      this.updateInterval = setInterval(async () => {
        await this.updateAllWills();
      }, this.UPDATE_INTERVAL_MS);

      console.log('[EffectivePullAmount] Service started successfully');
    } catch (error) {
      console.error('[EffectivePullAmount] Failed to start service:', error);
      throw error;
    }
  }

  /**
   * Stop the service
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('[EffectivePullAmount] Service stopped');
    }
  }

  /**
   * Update effectivePullAmount for all wills
   * @private
   */
  private async updateAllWills(): Promise<void> {
    try {
      // Get all wills that are not yet locked
      const wills = await prisma.will.findMany({
        where: {
          isLocked: false,
        },
        select: {
          id: true,
          contractAddress: true,
          ownerAddress: true,
        },
      });

      if (wills.length === 0) {
        return; // No wills to update
      }

      console.log(
        `[EffectivePullAmount] Updating ${wills.length} wills...`
      );

      // Process in batches to avoid RPC overload
      for (let i = 0; i < wills.length; i += this.MAX_PARALLEL_UPDATES) {
        const batch = wills.slice(i, i + this.MAX_PARALLEL_UPDATES);
        await Promise.all(batch.map((will) => this.updateWillAmount(will)));
      }

      console.log(
        `[EffectivePullAmount] Successfully updated ${wills.length} wills`
      );
    } catch (error) {
      console.error('[EffectivePullAmount] Error updating wills:', error);
      // Continue on error
    }
  }

  /**
   * Update effectivePullAmount for a single will
   * @private
   */
  private async updateWillAmount(will: {
    id: string;
    contractAddress: string;
    ownerAddress: string;
  }): Promise<void> {
    try {
      // Call getEffectivePullAmount on the will contract
      const effectiveAmount = await viemClient.readContract({
        address: will.contractAddress as `0x${string}`,
        abi: CHAINWILL_PARSED_ABI,
        functionName: 'getEffectivePullAmount',
      });

      const effectiveAmountStr = effectiveAmount.toString();

      // Update the database
      await prisma.will.update({
        where: { id: will.id },
        data: {
          effectivePullAmount: effectiveAmountStr,
        },
      });

      console.log(
        `[EffectivePullAmount] Updated will ${will.id}: ${effectiveAmountStr}`
      );
    } catch (error) {
      console.error(
        `[EffectivePullAmount] Error updating will ${will.id}:`,
        error instanceof Error ? error.message : error
      );
      // Continue processing other wills
    }
  }

  /**
   * Manually trigger an update for a specific will
   * Useful for forcing an immediate update after approval events
   */
  async updateWillById(willId: string): Promise<string | null> {
    try {
      const will = await prisma.will.findUnique({
        where: { id: willId },
        select: {
          id: true,
          contractAddress: true,
          ownerAddress: true,
        },
      });

      if (!will) {
        console.warn(`[EffectivePullAmount] Will ${willId} not found`);
        return null;
      }

      await this.updateWillAmount(will);
      
      // Return the updated effective amount
      const updated = await prisma.will.findUnique({
        where: { id: willId },
        select: { effectivePullAmount: true },
      });

      return updated?.effectivePullAmount || null;
    } catch (error) {
      console.error(
        `[EffectivePullAmount] Error manually updating will ${willId}:`,
        error
      );
      return null;
    }
  }
}

// Export singleton instance
export const effectivePullAmountService = new EffectivePullAmountService();
