"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvalListener = exports.ApprovalListenerService = void 0;
const web3_1 = require("../config/web3");
const db_1 = require("../config/db");
const abi_1 = require("../config/abi");
/**
 * Service to listen for Approval events on the ChainWillToken contract.
 * When an owner approves a will address, we update the approvedAmount in our DB.
 */
class ApprovalListenerService {
    pollInterval = null;
    lastProcessedBlock = 0;
    CWT_ADDRESS = abi_1.CWT_ADDRESS;
    POLL_INTERVAL_MS = parseInt(process.env.APPROVAL_POLL_INTERVAL || '30000', 10); // 30s default
    /**
     * Start polling for Approval events
     */
    async start() {
        console.log('[ApprovalListener] Starting approval event listener...');
        try {
            // Get current block to start from
            const currentBlock = await web3_1.viemClient.getBlockNumber();
            this.lastProcessedBlock = Number(currentBlock) - 100; // Start from 100 blocks back for safety
            console.log(`[ApprovalListener] Starting from block ${this.lastProcessedBlock}`);
            // Start polling
            this.pollInterval = setInterval(async () => {
                await this.pollEvents();
            }, this.POLL_INTERVAL_MS);
            console.log('[ApprovalListener] Approval event listener started successfully');
        }
        catch (error) {
            console.error('[ApprovalListener] Failed to start listener:', error);
            throw error;
        }
    }
    /**
     * Stop the listener
     */
    stop() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
            console.log('[ApprovalListener] Approval event listener stopped');
        }
    }
    /**
     * Poll for new Approval events
     * @private
     */
    async pollEvents() {
        try {
            const currentBlock = await web3_1.viemClient.getBlockNumber();
            const toBlock = Number(currentBlock);
            if (toBlock <= this.lastProcessedBlock) {
                return; // No new blocks
            }
            const logs = await web3_1.viemClient.getLogs({
                address: this.CWT_ADDRESS,
                event: abi_1.CWT_ABI[0],
                fromBlock: BigInt(this.lastProcessedBlock + 1),
                toBlock: BigInt(toBlock),
            });
            if (logs.length > 0) {
                console.log(`[ApprovalListener] Found ${logs.length} approval events`);
                await this.processApprovalEvents(logs);
            }
            this.lastProcessedBlock = toBlock;
        }
        catch (error) {
            console.error('[ApprovalListener] Error polling events:', error);
            // Continue polling even on error
        }
    }
    /**
     * Process approval events and update the database
     * @private
     */
    async processApprovalEvents(logs) {
        for (const log of logs) {
            if (!log.args || !log.args.owner || !log.args.spender || log.args.value === undefined) {
                console.warn('[ApprovalListener] Log missing required args:', log);
                continue;
            }
            const owner = log.args.owner;
            const spender = log.args.spender;
            const value = log.args.value;
            try {
                const existingEvent = await db_1.prisma.eventLog.findUnique({
                    where: { txHash: log.transactionHash },
                });
                if (existingEvent) {
                    continue;
                }
                // Find all wills with this spender address (will contract address)
                const wills = await db_1.prisma.will.findMany({
                    where: {
                        contractAddress: spender.toLowerCase(),
                        ownerAddress: owner.toLowerCase(),
                    },
                });
                if (wills.length === 0) {
                    console.log(`[ApprovalListener] No will found for owner ${owner} and contract ${spender}`);
                    continue;
                }
                // Update each will's approvedAmount and create event log
                for (const will of wills) {
                    const approvedAmountStr = value.toString();
                    await Promise.all([
                        // Update the will's approvedAmount
                        db_1.prisma.will.update({
                            where: { id: will.id },
                            data: {
                                approvedAmount: approvedAmountStr,
                            },
                        }),
                        // Log the event for audit trail
                        db_1.prisma.erc20Approval.create({
                            data: {
                                willId: will.id,
                                ownerAddress: owner.toLowerCase(),
                                tokenAddress: this.CWT_ADDRESS,
                                approvedAmount: approvedAmountStr,
                                blockNumber: Number(log.blockNumber),
                                timestamp: new Date(),
                            },
                        }),
                        // Log the event
                        db_1.prisma.eventLog.create({
                            data: {
                                willAddress: spender.toLowerCase(),
                                eventName: 'Approval',
                                txHash: log.transactionHash,
                                blockNumber: Number(log.blockNumber),
                                data: {
                                    owner,
                                    spender,
                                    value: approvedAmountStr,
                                },
                            },
                        }).catch((err) => {
                            // Ignore duplicate txHash errors
                            if (err.code !== 'P2002')
                                throw err;
                        }),
                    ]);
                    console.log(`[ApprovalListener] Updated will ${will.id} with approvedAmount: ${approvedAmountStr}`);
                }
            }
            catch (error) {
                console.error(`[ApprovalListener] Error processing approval event for owner ${owner}:`, error);
            }
        }
    }
}
exports.ApprovalListenerService = ApprovalListenerService;
// Export singleton instance
exports.approvalListener = new ApprovalListenerService();
