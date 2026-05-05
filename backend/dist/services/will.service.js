"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.willService = void 0;
const viem_1 = require("viem");
const db_1 = require("../config/db");
const web3_1 = require("../config/web3");
const abi_1 = require("../config/abi");
function normalizeAddress(address, fieldName = 'address') {
    if (!address || !(0, viem_1.isAddress)(address)) {
        throw new Error(`Invalid ${fieldName}`);
    }
    return address.toLowerCase();
}
const willInclude = {
    beneficiaries: {
        orderBy: { beneficiaryId: 'asc' },
    },
    signers: {
        orderBy: { signerAddress: 'asc' },
    },
    erc20Approvals: {
        orderBy: { timestamp: 'desc' },
        take: 10,
    },
};
exports.willService = {
    normalizeAddress,
    async getWillsByOwner(ownerAddress) {
        const owner = normalizeAddress(ownerAddress, 'ownerAddress');
        return db_1.prisma.will.findMany({
            where: { ownerAddress: owner },
            include: willInclude,
            orderBy: { createdAt: 'desc' },
        });
    },
    async getWillByAddress(willAddress) {
        const address = normalizeAddress(willAddress, 'willAddress');
        return db_1.prisma.will.findUnique({
            where: { contractAddress: address },
            include: willInclude,
        });
    },
    async getWillStatus(willAddress) {
        const address = normalizeAddress(willAddress, 'willAddress');
        const will = await db_1.prisma.will.findUnique({
            where: { contractAddress: address },
            select: {
                id: true,
                contractAddress: true,
                ownerAddress: true,
                approvedAmount: true,
                effectivePullAmount: true,
                finalPool: true,
                feePaid: true,
                inactivityPeriod: true,
                gracePeriod: true,
                lastCheckIn: true,
                isTriggered: true,
                isLocked: true,
                attestationOpen: true,
                triggeredAt: true,
            },
        });
        if (!will) {
            return null;
        }
        try {
            const [chainStatus, attestationStatus] = await Promise.all([
                web3_1.viemClient.readContract({
                    address: address,
                    abi: abi_1.CHAINWILL_PARSED_ABI,
                    functionName: 'getWillStatus',
                }),
                web3_1.viemClient.readContract({
                    address: address,
                    abi: abi_1.CHAINWILL_PARSED_ABI,
                    functionName: 'getAttestationStatus',
                }),
            ]);
            const [approvedAmount, , effectivePullAmount, timeRemaining, attestationOpensAt, triggerUnlocksAt, triggered, locked, finalPool,] = chainStatus;
            const [attestationOpen, signatureCount, requiredSignatures] = attestationStatus;
            return {
                willAddress: will.contractAddress,
                isTriggered: triggered,
                isLocked: locked,
                attestationOpen,
                approvedAmount: approvedAmount.toString(),
                effectivePullAmount: effectivePullAmount.toString(),
                finalPool: finalPool.toString(),
                feePaid: will.feePaid,
                signatureCount: signatureCount.toString(),
                requiredSignatures: requiredSignatures.toString(),
                timeLimits: {
                    lastCheckIn: will.lastCheckIn,
                    inactivityPeriod: will.inactivityPeriod,
                    gracePeriod: will.gracePeriod,
                    timeRemaining: timeRemaining.toString(),
                    attestationOpensAt: new Date(Number(attestationOpensAt) * 1000),
                    triggerUnlocksAt: new Date(Number(triggerUnlocksAt) * 1000),
                },
            };
        }
        catch (error) {
            console.warn(`[WillService] Falling back to DB status for ${address}:`, error instanceof Error ? error.message : error);
            return {
                willAddress: will.contractAddress,
                isTriggered: will.isTriggered,
                isLocked: will.isLocked,
                attestationOpen: will.attestationOpen,
                approvedAmount: will.approvedAmount,
                effectivePullAmount: will.effectivePullAmount,
                finalPool: will.finalPool,
                feePaid: will.feePaid,
                triggeredAt: will.triggeredAt,
                timeLimits: {
                    lastCheckIn: will.lastCheckIn,
                    inactivityPeriod: will.inactivityPeriod,
                    gracePeriod: will.gracePeriod,
                    attestationOpensAt: new Date(will.lastCheckIn.getTime() + will.inactivityPeriod * 1000),
                    triggerUnlocksAt: new Date(will.lastCheckIn.getTime() + (will.inactivityPeriod + will.gracePeriod) * 1000),
                },
            };
        }
    },
    async getBeneficiaries(willAddress) {
        const will = await this.getWillByAddress(willAddress);
        return will ? will.beneficiaries : null;
    },
    async getSigners(willAddress) {
        const will = await this.getWillByAddress(willAddress);
        return will ? will.signers : null;
    },
    async getClaimsByBeneficiary(walletAddress) {
        const wallet = normalizeAddress(walletAddress, 'walletAddress');
        return db_1.prisma.beneficiary.findMany({
            where: { walletAddress: wallet },
            include: {
                will: {
                    include: {
                        signers: {
                            orderBy: { signerAddress: 'asc' },
                        },
                    },
                },
            },
            orderBy: { will: { createdAt: 'desc' } },
        });
    },
    async getWillsBySigner(walletAddress) {
        const wallet = normalizeAddress(walletAddress, 'walletAddress');
        return db_1.prisma.signer.findMany({
            where: {
                signerAddress: wallet,
                replacedAt: null,
            },
            include: {
                will: {
                    include: {
                        beneficiaries: {
                            orderBy: { beneficiaryId: 'asc' },
                        },
                    },
                },
            },
            orderBy: { will: { createdAt: 'desc' } },
        });
    },
};
