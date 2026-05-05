"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWillsByOwner = getWillsByOwner;
exports.getWillByAddress = getWillByAddress;
exports.getWillStatus = getWillStatus;
exports.getWillBeneficiaries = getWillBeneficiaries;
exports.getWillSigners = getWillSigners;
exports.getBeneficiaryClaims = getBeneficiaryClaims;
exports.getSignerWills = getSignerWills;
exports.getWillDetails = getWillDetails;
exports.refreshEffectivePullAmount = refreshEffectivePullAmount;
exports.getApprovalHistory = getApprovalHistory;
const effectivePullAmount_1 = require("../services/effectivePullAmount");
const db_1 = require("../config/db");
const will_service_1 = require("../services/will.service");
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
function handleControllerError(res, error, fallback) {
    if (error instanceof Error && error.message.startsWith('Invalid ')) {
        return res.status(400).json({ error: error.message });
    }
    console.error(`[WillController] ${fallback}:`, error);
    return res.status(500).json({ error: fallback });
}
function paramValue(value, name) {
    if (!value || Array.isArray(value)) {
        throw new Error(`Invalid ${name}`);
    }
    return value;
}
async function getWillsByOwner(req, res) {
    if (!checkDatabaseConnection(res))
        return;
    try {
        const wills = await will_service_1.willService.getWillsByOwner(paramValue(req.params.ownerAddress, 'ownerAddress'));
        return res.json(wills);
    }
    catch (error) {
        return handleControllerError(res, error, 'Failed to fetch owner wills');
    }
}
async function getWillByAddress(req, res) {
    if (!checkDatabaseConnection(res))
        return;
    try {
        const will = await will_service_1.willService.getWillByAddress(paramValue(req.params.willAddress, 'willAddress'));
        if (!will) {
            return res.status(404).json({ error: 'Will not found' });
        }
        return res.json(will);
    }
    catch (error) {
        return handleControllerError(res, error, 'Failed to fetch will');
    }
}
async function getWillStatus(req, res) {
    if (!checkDatabaseConnection(res))
        return;
    try {
        const status = await will_service_1.willService.getWillStatus(paramValue(req.params.willAddress, 'willAddress'));
        if (!status) {
            return res.status(404).json({ error: 'Will not found' });
        }
        return res.json(status);
    }
    catch (error) {
        return handleControllerError(res, error, 'Failed to fetch will status');
    }
}
async function getWillBeneficiaries(req, res) {
    if (!checkDatabaseConnection(res))
        return;
    try {
        const beneficiaries = await will_service_1.willService.getBeneficiaries(paramValue(req.params.willAddress, 'willAddress'));
        if (!beneficiaries) {
            return res.status(404).json({ error: 'Will not found' });
        }
        return res.json(beneficiaries);
    }
    catch (error) {
        return handleControllerError(res, error, 'Failed to fetch beneficiaries');
    }
}
async function getWillSigners(req, res) {
    if (!checkDatabaseConnection(res))
        return;
    try {
        const signers = await will_service_1.willService.getSigners(paramValue(req.params.willAddress, 'willAddress'));
        if (!signers) {
            return res.status(404).json({ error: 'Will not found' });
        }
        return res.json(signers);
    }
    catch (error) {
        return handleControllerError(res, error, 'Failed to fetch signers');
    }
}
async function getBeneficiaryClaims(req, res) {
    if (!checkDatabaseConnection(res))
        return;
    try {
        const claims = await will_service_1.willService.getClaimsByBeneficiary(paramValue(req.params.walletAddress, 'walletAddress'));
        return res.json(claims);
    }
    catch (error) {
        return handleControllerError(res, error, 'Failed to fetch beneficiary claims');
    }
}
async function getSignerWills(req, res) {
    if (!checkDatabaseConnection(res))
        return;
    try {
        const wills = await will_service_1.willService.getWillsBySigner(paramValue(req.params.walletAddress, 'walletAddress'));
        return res.json(wills);
    }
    catch (error) {
        return handleControllerError(res, error, 'Failed to fetch signer wills');
    }
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
