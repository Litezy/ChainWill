"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inactivityMonitorJob = exports.InactivityMonitorJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const viem_1 = require("viem");
const db_1 = require("../config/db");
const abi_1 = require("../config/abi");
const web3_1 = require("../config/web3");
const notificationQueue_1 = require("../queues/notificationQueue");
const alertDispatcher_1 = require("../services/alertDispatcher");
const chainWillAbi = (0, viem_1.parseAbi)(abi_1.CHAINWILL_ABI);
class InactivityMonitorJob {
    task = null;
    isRunning = false;
    lastCompletedAt = null;
    schedule = '* * * * *';
    maxParallelChecks = parseInt(process.env.MONITOR_MAX_PARALLEL_CHECKS || '5', 10);
    maxParallelTriggers = parseInt(process.env.RELAYER_MAX_PARALLEL_TXS || '2', 10);
    gasBufferBps = parseInt(process.env.RELAYER_GAS_BUFFER_BPS || '500', 10);
    async start() {
        if (this.task) {
            console.warn('[InactivityMonitor] Monitor already running');
            return;
        }
        const relayerStatus = (0, web3_1.getAdminRelayerStatus)();
        if (relayerStatus.error) {
            throw new Error(`[InactivityMonitor] Relayer configuration invalid: ${relayerStatus.error}`);
        }
        if (!relayerStatus.configured) {
            throw new Error('[InactivityMonitor] ADMIN_PRIVATE_KEY must be configured for the mandatory admin relayer');
        }
        console.log(`[InactivityMonitor] Starting monitor with schedule ${this.schedule}`);
        console.log(`[InactivityMonitor] Admin relayer configured for ${relayerStatus.address}`);
        await this.runCycle();
        this.task = node_cron_1.default.schedule(this.schedule, () => {
            void this.runCycle();
        });
    }
    stop() {
        if (!this.task) {
            return;
        }
        this.task.stop();
        this.task = null;
        console.log('[InactivityMonitor] Monitor stopped');
    }
    isHealthy() {
        return this.task !== null;
    }
    getStatus() {
        const relayerStatus = (0, web3_1.getAdminRelayerStatus)();
        return {
            running: this.task !== null,
            configured: relayerStatus.configured && !relayerStatus.error,
            relayerAddress: relayerStatus.address,
            lastCompletedAt: this.lastCompletedAt?.toISOString() ?? null,
        };
    }
    async runCycle() {
        if (this.isRunning) {
            console.warn('[InactivityMonitor] Previous cycle still running, skipping');
            return;
        }
        this.isRunning = true;
        try {
            const [triggerableWillIds, wills] = await Promise.all([
                this.getTriggerableWillIds(),
                db_1.prisma.will.findMany({
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
                console.log(`[InactivityMonitor] Found ${triggerableWillIdSet.size} wills eligible for admin trigger`);
            }
            console.log(`[InactivityMonitor] Checking ${wills.length} active wills`);
            for (let i = 0; i < wills.length; i += this.maxParallelChecks) {
                const batch = wills.slice(i, i + this.maxParallelChecks);
                const batchTriggerableWillIds = batch
                    .filter((will) => triggerableWillIdSet.has(will.id))
                    .map((will) => will.id);
                for (let triggerIndex = 0; triggerIndex < batchTriggerableWillIds.length; triggerIndex += this.maxParallelTriggers) {
                    const triggerIdBatch = new Set(batchTriggerableWillIds.slice(triggerIndex, triggerIndex + this.maxParallelTriggers));
                    await Promise.all(batch
                        .filter((will) => triggerIdBatch.has(will.id))
                        .map((will) => this.processWill(will, true)));
                }
                await Promise.all(batch
                    .filter((will) => !triggerableWillIdSet.has(will.id))
                    .map((will) => this.processWill(will, false)));
            }
            this.lastCompletedAt = new Date();
        }
        catch (error) {
            console.error('[InactivityMonitor] Monitor cycle failed:', error);
        }
        finally {
            this.isRunning = false;
        }
    }
    async getTriggerableWillIds() {
        const rows = await db_1.prisma.$queryRaw `
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
    async processWill(will, shouldAttemptTrigger) {
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
        }
        catch (error) {
            console.error(`[InactivityMonitor] Failed to process will ${will.id}:`, error instanceof Error ? error.message : error);
        }
    }
    async readOnChainState(will) {
        const [attestationStatus, ownerBalance] = await Promise.all([
            web3_1.viemClient.readContract({
                address: will.contractAddress,
                abi: chainWillAbi,
                functionName: 'getAttestationStatus',
            }),
            web3_1.viemClient.readContract({
                address: will.contractAddress,
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
    async triggerAttestationWindow(will) {
        const { account, walletClient } = (0, web3_1.assertAdminRelayerConfigured)();
        try {
            const estimatedGas = await web3_1.viemClient.estimateContractGas({
                account,
                address: will.contractAddress,
                abi: chainWillAbi,
                functionName: 'triggerByTime',
            });
            const transactionHash = await walletClient.writeContract({
                account,
                chain: undefined,
                address: will.contractAddress,
                abi: chainWillAbi,
                functionName: 'triggerByTime',
                gas: this.withGasBuffer(estimatedGas),
                ...(await this.getFeeConfiguration()),
            });
            const receipt = await web3_1.viemClient.waitForTransactionReceipt({
                hash: transactionHash,
            });
            if (receipt.status !== 'success') {
                throw new Error(`triggerByTime transaction reverted: ${transactionHash}`);
            }
            await db_1.prisma.eventLog
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
                .catch((error) => {
                if (error.code !== 'P2002') {
                    throw error;
                }
            });
            console.log(`[InactivityMonitor] Opened attestation window for will ${will.id} (${transactionHash})`);
            return true;
        }
        catch (error) {
            console.error(`[InactivityMonitor] Failed to call triggerByTime for will ${will.id}:`, error instanceof Error ? error.message : error);
            return false;
        }
    }
    async getFeeConfiguration() {
        try {
            const fees = await web3_1.viemClient.estimateFeesPerGas();
            if (typeof fees.maxFeePerGas === 'bigint' &&
                typeof fees.maxPriorityFeePerGas === 'bigint') {
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
        }
        catch (error) {
            console.warn('[InactivityMonitor] Failed to estimate EIP-1559 fees, falling back to gasPrice:', error instanceof Error ? error.message : error);
        }
        try {
            return {
                gasPrice: await web3_1.viemClient.getGasPrice(),
            };
        }
        catch (error) {
            console.warn('[InactivityMonitor] Failed to fetch gasPrice for relayer transaction:', error instanceof Error ? error.message : error);
            return {};
        }
    }
    withGasBuffer(estimatedGas) {
        const boundedBufferBps = Math.min(Math.max(this.gasBufferBps, 0), 1_000);
        const buffer = (estimatedGas * BigInt(boundedBufferBps)) / 10000n;
        return estimatedGas + buffer;
    }
    async syncWillState(will, attestationOpen, ownerBalance) {
        const approvedAmount = BigInt(will.approvedAmount);
        const ownerBalanceString = ownerBalance.toString();
        const fundingReasons = [];
        if (approvedAmount === 0n) {
            fundingReasons.push('approvedAmount is 0');
        }
        if (ownerBalance < approvedAmount) {
            fundingReasons.push('owner balance is below approvedAmount');
        }
        const updateData = {};
        if (will.attestationOpen !== attestationOpen) {
            updateData.attestationOpen = attestationOpen;
        }
        if (!attestationOpen && will.attestationAlertSentAt) {
            updateData.attestationAlertSentAt = null;
        }
        if (!attestationOpen && will.attestationAlertEnqueuedAt) {
            updateData.attestationAlertEnqueuedAt = null;
        }
        if (attestationOpen &&
            !will.attestationAlertSentAt &&
            !will.attestationAlertEnqueuedAt) {
            const recipients = Array.from(new Set(will.signers
                .map((signer) => alertDispatcher_1.alertDispatcher.resolveRecipientEmail({
                address: signer.signerAddress,
                email: signer.signerEmail,
            }))
                .filter((email) => Boolean(email))));
            await notificationQueue_1.notificationQueue.enqueue({
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
        if (fundingReasons.length > 0 &&
            !will.fundingRiskAlertSentAt &&
            !will.fundingRiskAlertEnqueuedAt) {
            const ownerEmail = alertDispatcher_1.alertDispatcher.resolveRecipientEmail({
                address: will.ownerAddress,
                email: will.ownerEmail,
            });
            await notificationQueue_1.notificationQueue.enqueue({
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
            await db_1.prisma.will.update({
                where: { id: will.id },
                data: updateData,
            });
        }
    }
}
exports.InactivityMonitorJob = InactivityMonitorJob;
exports.inactivityMonitorJob = new InactivityMonitorJob();
