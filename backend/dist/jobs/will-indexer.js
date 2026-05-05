"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.willIndexer = exports.WillIndexer = void 0;
const viem_1 = require("viem");
const db_1 = require("../config/db");
const abi_1 = require("../config/abi");
const web3_1 = require("../config/web3");
const CHILD_WILL_EVENTS = [
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
class WillIndexer {
    pollInterval = null;
    lastProcessedBlock = 0;
    pollIntervalMs = parseInt(process.env.WILL_POLL_INTERVAL || '30000', 10);
    lookbackBlocks = parseInt(process.env.WILL_LOOKBACK_BLOCKS || '100', 10);
    async start() {
        if (this.pollInterval) {
            console.warn('[WillIndexer] Already running');
            return;
        }
        const currentBlock = await web3_1.viemClient.getBlockNumber();
        this.lastProcessedBlock = Math.max(Number(currentBlock) - this.lookbackBlocks, 0);
        console.log(`[WillIndexer] Listening to child wills from block ${this.lastProcessedBlock}`);
        await this.pollEvents();
        this.pollInterval = setInterval(() => {
            this.pollEvents().catch((error) => {
                console.error('[WillIndexer] Poll failed:', error);
            });
        }, this.pollIntervalMs);
    }
    stop() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
            console.log('[WillIndexer] Stopped');
        }
    }
    async pollEvents() {
        const wills = await db_1.prisma.will.findMany({
            select: { contractAddress: true },
        });
        const addresses = wills.map((will) => will.contractAddress);
        if (addresses.length === 0) {
            return;
        }
        const currentBlock = await web3_1.viemClient.getBlockNumber();
        const toBlock = Number(currentBlock);
        if (toBlock <= this.lastProcessedBlock) {
            return;
        }
        for (const eventName of CHILD_WILL_EVENTS) {
            const logs = (await web3_1.viemClient.getLogs({
                address: addresses,
                event: (0, viem_1.getAbiItem)({ abi: abi_1.CHAINWILL_PARSED_ABI, name: eventName }),
                fromBlock: BigInt(this.lastProcessedBlock + 1),
                toBlock: BigInt(toBlock),
            }));
            for (const log of logs) {
                await this.processChildWillEvent({
                    eventName,
                    willAddress: log.address.toLowerCase(),
                    args: log.args || {},
                    blockNumber: log.blockNumber,
                    logIndex: log.logIndex,
                    transactionHash: log.transactionHash,
                });
            }
        }
        this.lastProcessedBlock = toBlock;
    }
    async processChildWillEvent(log) {
        const existingEvent = await db_1.prisma.eventLog.findUnique({
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
        const will = await db_1.prisma.will.findUnique({
            where: { contractAddress: log.willAddress },
            select: { id: true },
        });
        if (!will) {
            console.warn(`[WillIndexer] No DB will found for ${log.willAddress}`);
            return;
        }
        const block = await web3_1.viemClient.getBlock({ blockNumber: log.blockNumber });
        const blockTimestamp = new Date(Number(block.timestamp) * 1000);
        await db_1.prisma.$transaction(async (tx) => {
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
                            percent: this.bigIntToNumber(log.eventName === 'BeneficiaryUpdated' ? log.args.newPercent : log.args.percent),
                        },
                        create: {
                            willId: will.id,
                            beneficiaryId: this.bigIntToNumber(log.args.id),
                            walletAddress: this.addressArg(log.args.wallet),
                            percent: this.bigIntToNumber(log.eventName === 'BeneficiaryUpdated' ? log.args.newPercent : log.args.percent),
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
                    logIndex: log.logIndex,
                    blockNumber: Number(log.blockNumber),
                    timestamp: blockTimestamp,
                    data: this.serializeArgs(log.args),
                },
            });
        });
        console.log(`[WillIndexer] Indexed ${log.eventName} for ${log.willAddress}`);
    }
    addressArg(value) {
        if (typeof value !== 'string') {
            throw new Error('Expected address event arg');
        }
        return value.toLowerCase();
    }
    bigIntToString(value) {
        return typeof value === 'bigint' ? value.toString() : String(value ?? '0');
    }
    bigIntToNumber(value) {
        return Number(typeof value === 'bigint' ? value : BigInt(String(value ?? 0)));
    }
    bigIntTimestampToDate(value, fallback) {
        if (value === undefined || value === null) {
            return fallback;
        }
        return new Date(this.bigIntToNumber(value) * 1000);
    }
    serializeArgs(args) {
        return Object.fromEntries(Object.entries(args).map(([key, value]) => [
            key,
            typeof value === 'bigint' ? value.toString() : value,
        ]));
    }
}
exports.WillIndexer = WillIndexer;
exports.willIndexer = new WillIndexer();
