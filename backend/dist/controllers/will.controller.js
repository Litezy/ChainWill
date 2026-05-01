"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWillDetails = getWillDetails;
exports.refreshEffectivePullAmount = refreshEffectivePullAmount;
exports.getApprovalHistory = getApprovalHistory;
const effectivePullAmount_1 = require("../services/effectivePullAmount");
const db_1 = require("../config/db");
async function getWillDetails(req, res) {
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
