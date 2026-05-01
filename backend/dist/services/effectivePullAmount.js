"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.effectivePullAmountService = exports.EffectivePullAmountService = void 0;
const web3_1 = require("../config/web3");
const db_1 = require("../config/db");
const abi_1 = require("../config/abi");
// Minimal ABI for FundingModule to call getEffectivePullAmount
// Using the complete ChainWill ABI interface
/**
 * Service to periodically update effectivePullAmount for all wills.
 *
 * Calls getEffectivePullAmount() on each will contract to get the minimum of
 * (approved amount, owner wallet balance) and updates the database.
 */
class EffectivePullAmountService {
    updateInterval = null;
    UPDATE_INTERVAL_MS = parseInt(process.env.EFFECTIVE_AMOUNT_UPDATE_INTERVAL || '60000', 10); // 60s default
    MAX_PARALLEL_UPDATES = parseInt(process.env.MAX_PARALLEL_UPDATES || '5', 10); // Prevent RPC overload
    /**
     * Start the service
     */
    async start() {
        console.log('[EffectivePullAmount] Starting effective pull amount updater...');
        try {
            // Run once immediately
            await this.updateAllWills();
            // Then set up periodic updates
            this.updateInterval = setInterval(async () => {
                await this.updateAllWills();
            }, this.UPDATE_INTERVAL_MS);
            console.log('[EffectivePullAmount] Service started successfully');
        }
        catch (error) {
            console.error('[EffectivePullAmount] Failed to start service:', error);
            throw error;
        }
    }
    /**
     * Stop the service
     */
    stop() {
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
    async updateAllWills() {
        try {
            // Get all wills that are not yet locked
            const wills = await db_1.prisma.will.findMany({
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
            console.log(`[EffectivePullAmount] Updating ${wills.length} wills...`);
            // Process in batches to avoid RPC overload
            for (let i = 0; i < wills.length; i += this.MAX_PARALLEL_UPDATES) {
                const batch = wills.slice(i, i + this.MAX_PARALLEL_UPDATES);
                await Promise.all(batch.map((will) => this.updateWillAmount(will)));
            }
            console.log(`[EffectivePullAmount] Successfully updated ${wills.length} wills`);
        }
        catch (error) {
            console.error('[EffectivePullAmount] Error updating wills:', error);
            // Continue on error
        }
    }
    /**
     * Update effectivePullAmount for a single will
     * @private
     */
    async updateWillAmount(will) {
        try {
            // Call getEffectivePullAmount on the will contract
            const effectiveAmount = await web3_1.viemClient.readContract({
                address: will.contractAddress,
                abi: abi_1.CHAINWILL_ABI,
                functionName: 'getEffectivePullAmount',
            });
            const effectiveAmountStr = effectiveAmount.toString();
            // Update the database
            await db_1.prisma.will.update({
                where: { id: will.id },
                data: {
                    effectivePullAmount: effectiveAmountStr,
                },
            });
            console.log(`[EffectivePullAmount] Updated will ${will.id}: ${effectiveAmountStr}`);
        }
        catch (error) {
            console.error(`[EffectivePullAmount] Error updating will ${will.id}:`, error instanceof Error ? error.message : error);
            // Continue processing other wills
        }
    }
    /**
     * Manually trigger an update for a specific will
     * Useful for forcing an immediate update after approval events
     */
    async updateWillById(willId) {
        try {
            const will = await db_1.prisma.will.findUnique({
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
            const updated = await db_1.prisma.will.findUnique({
                where: { id: willId },
                select: { effectivePullAmount: true },
            });
            return updated?.effectivePullAmount || null;
        }
        catch (error) {
            console.error(`[EffectivePullAmount] Error manually updating will ${willId}:`, error);
            return null;
        }
    }
}
exports.EffectivePullAmountService = EffectivePullAmountService;
// Export singleton instance
exports.effectivePullAmountService = new EffectivePullAmountService();
