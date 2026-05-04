"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWillDetails = getWillDetails;
exports.refreshEffectivePullAmount = refreshEffectivePullAmount;
exports.getApprovalHistory = getApprovalHistory;
exports.notifyWillOwner = notifyWillOwner;
const effectivePullAmount_1 = require("../services/effectivePullAmount");
const db_1 = require("../config/db");
const alertDispatcher_1 = require("../services/alertDispatcher");
const notificationQueue_1 = require("../queues/notificationQueue");
function checkDatabaseConnection(res) {
    const dbConnected = global.dbConnected || false;
    if (!dbConnected) {
        res.status(503).json({
            error: 'Database unavailable. Please check your DATABASE_URL configuration.',
            hint: 'For testing without a database, use mock endpoints.',
        });
        return false;
    }
    return true;
}
async function getWillDetails(req, res) {
    if (!checkDatabaseConnection(res))
        return;
    try {
        const rawWillId = req.params.willId;
        if (!rawWillId || Array.isArray(rawWillId)) {
            return res.status(400).json({ error: 'Invalid willId' });
        }
        const willId = rawWillId;
        const will = await db_1.prisma.will.findUnique({
            where: { id: willId },
            include: {
                beneficiaries: true,
                signers: true,
                erc20Approvals: {
                    orderBy: { timestamp: 'desc' },
                    take: 10,
                },
            },
        });
        if (!will) {
            return res.status(404).json({ error: 'Will not found' });
        }
        return res.json(will);
    }
    catch (error) {
        console.error('[WillController] Error fetching will:', error);
        return res.status(500).json({ error: 'Failed to fetch will' });
    }
}
async function refreshEffectivePullAmount(req, res) {
    if (!checkDatabaseConnection(res))
        return;
    try {
        const rawWillId = req.params.willId;
        if (!rawWillId || Array.isArray(rawWillId)) {
            return res.status(400).json({ error: 'Invalid willId' });
        }
        const willId = rawWillId;
        const will = await db_1.prisma.will.findUnique({
            where: { id: willId },
        });
        if (!will) {
            return res.status(404).json({ error: 'Will not found' });
        }
        const newAmount = await effectivePullAmount_1.effectivePullAmountService.updateWillById(willId);
        if (newAmount === null) {
            return res.status(500).json({ error: 'Failed to update effective amount' });
        }
        return res.json({
            message: 'Effective pull amount updated',
            effectivePullAmount: newAmount,
        });
    }
    catch (error) {
        console.error('[WillController] Error refreshing effective amount:', error);
        return res.status(500).json({ error: 'Failed to refresh effective amount' });
    }
}
async function getApprovalHistory(req, res) {
    if (!checkDatabaseConnection(res))
        return;
    try {
        const rawWillId = req.params.willId;
        if (!rawWillId || Array.isArray(rawWillId)) {
            return res.status(400).json({ error: 'Invalid willId' });
        }
        const willId = rawWillId;
        let limit = 50;
        let offset = 0;
        if (typeof req.query.limit === 'string') {
            limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
        }
        if (typeof req.query.offset === 'string') {
            offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
        }
        const approvals = await db_1.prisma.erc20Approval.findMany({
            where: { willId },
            orderBy: { timestamp: 'desc' },
            take: limit,
            skip: offset,
        });
        const total = await db_1.prisma.erc20Approval.count({
            where: { willId },
        });
        return res.json({
            approvals,
            total,
            limit,
            offset,
        });
    }
    catch (error) {
        console.error('[WillController] Error fetching approval history:', error);
        return res.status(500).json({ error: 'Failed to fetch approval history' });
    }
}
function isValidAddress(value) {
    return /^0x[a-fA-F0-9]{40}$/.test(value);
}
async function notifyWillOwner(req, res) {
    if (!checkDatabaseConnection(res))
        return;
    try {
        const rawWillAddress = req.params.willAddress;
        if (!rawWillAddress || Array.isArray(rawWillAddress)) {
            return res.status(400).json({ error: 'Invalid willAddress' });
        }
        if (!isValidAddress(rawWillAddress)) {
            return res.status(400).json({ error: 'willAddress must be a valid EVM address' });
        }
        const will = await db_1.prisma.will.findFirst({
            where: {
                contractAddress: {
                    equals: rawWillAddress,
                    mode: 'insensitive',
                },
            },
        });
        if (!will) {
            return res.status(404).json({ error: 'Will not found' });
        }
        const ownerEmail = alertDispatcher_1.alertDispatcher.resolveRecipientEmail({
            address: will.ownerAddress,
            email: will.ownerEmail,
        });
        if (!ownerEmail) {
            return res.status(400).json({
                error: 'Owner email is not available for this will',
            });
        }
        await notificationQueue_1.notificationQueue.enqueue({
            type: 'manual-check-in-reminder',
            willId: will.id,
            contractAddress: will.contractAddress,
            recipients: [ownerEmail],
            ownerAddress: will.ownerAddress,
        });
        return res.status(202).json({
            message: 'Check-in reminder queued',
            willId: will.id,
            willAddress: will.contractAddress,
            recipient: ownerEmail,
        });
    }
    catch (error) {
        console.error('[WillController] Error queueing manual check-in reminder:', error);
        return res.status(500).json({ error: 'Failed to queue check-in reminder' });
    }
}
