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
    schedule = '* * * * *';
    maxParallelChecks = parseInt(process.env.MONITOR_MAX_PARALLEL_CHECKS || '5', 10);
    async start() {
        if (this.task) {
            console.warn('[InactivityMonitor] Monitor already running');
            return;
        }
        console.log(`[InactivityMonitor] Starting monitor with schedule ${this.schedule}`);
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
    async runCycle() {
        if (this.isRunning) {
            console.warn('[InactivityMonitor] Previous cycle still running, skipping');
            return;
        }
        this.isRunning = true;
        try {
            const wills = await db_1.prisma.will.findMany({
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
        }
        catch (error) {
            console.error('[InactivityMonitor] Monitor cycle failed:', error);
        }
        finally {
            this.isRunning = false;
        }
    }
    async processWill(will) {
        try {
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
        catch (error) {
            console.error(`[InactivityMonitor] Failed to process will ${will.id}:`, error instanceof Error ? error.message : error);
        }
    }
}
exports.InactivityMonitorJob = InactivityMonitorJob;
exports.inactivityMonitorJob = new InactivityMonitorJob();
