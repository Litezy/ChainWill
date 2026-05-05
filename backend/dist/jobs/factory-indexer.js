"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.factoryIndexer = exports.FactoryIndexer = void 0;
const viem_1 = require("viem");
const db_1 = require("../config/db");
const abi_1 = require("../config/abi");
const web3_1 = require("../config/web3");
class FactoryIndexer {
    pollInterval = null;
    lastProcessedBlock = 0;
    pollIntervalMs = parseInt(process.env.FACTORY_POLL_INTERVAL || '30000', 10);
    lookbackBlocks = parseInt(process.env.FACTORY_LOOKBACK_BLOCKS || '100', 10);
    defaultInactivityPeriod = parseInt(process.env.DEFAULT_INACTIVITY_PERIOD || '120', 10);
    defaultGracePeriod = parseInt(process.env.DEFAULT_GRACE_PERIOD || '120', 10);
    async start() {
        if (this.pollInterval) {
            console.warn('[FactoryIndexer] Already running');
            return;
        }
        const currentBlock = await web3_1.viemClient.getBlockNumber();
        this.lastProcessedBlock = Math.max(Number(currentBlock) - this.lookbackBlocks, 0);
        console.log(`[FactoryIndexer] Listening to ${abi_1.FACTORY_ADDRESS} from block ${this.lastProcessedBlock}`);
        await this.pollEvents();
        this.pollInterval = setInterval(() => {
            this.pollEvents().catch((error) => {
                console.error('[FactoryIndexer] Poll failed:', error);
            });
        }, this.pollIntervalMs);
    }
    stop() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
            console.log('[FactoryIndexer] Stopped');
        }
    }
    async pollEvents() {
        const currentBlock = await web3_1.viemClient.getBlockNumber();
        const toBlock = Number(currentBlock);
        if (toBlock <= this.lastProcessedBlock) {
            return;
        }
        const logs = await web3_1.viemClient.getLogs({
            address: abi_1.FACTORY_ADDRESS,
            event: (0, viem_1.getAbiItem)({ abi: abi_1.FACTORY_PARSED_ABI, name: 'WillCreated' }),
            fromBlock: BigInt(this.lastProcessedBlock + 1),
            toBlock: BigInt(toBlock),
        });
        for (const log of logs) {
            await this.processWillCreated(log);
        }
        this.lastProcessedBlock = toBlock;
    }
    async processWillCreated(log) {
        const willAddress = log.args?.will?.toLowerCase();
        const ownerAddress = log.args?.owner?.toLowerCase();
        const tokenAddress = log.args?.token?.toLowerCase();
        if (!willAddress || !ownerAddress || !tokenAddress) {
            console.warn('[FactoryIndexer] Skipping WillCreated log with missing args:', log);
            return;
        }
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
        const block = await web3_1.viemClient.getBlock({ blockNumber: log.blockNumber });
        const blockTimestamp = new Date(Number(block.timestamp) * 1000);
        let signerAddresses = [];
        try {
            const signers = await web3_1.viemClient.readContract({
                address: willAddress,
                abi: abi_1.CHAINWILL_PARSED_ABI,
                functionName: 'getSigners',
            });
            signerAddresses = signers.map((signer) => signer.toLowerCase());
        }
        catch (error) {
            console.warn(`[FactoryIndexer] Could not read signers for ${willAddress}:`, error instanceof Error ? error.message : error);
        }
        await db_1.prisma.$transaction(async (tx) => {
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
exports.FactoryIndexer = FactoryIndexer;
exports.factoryIndexer = new FactoryIndexer();
