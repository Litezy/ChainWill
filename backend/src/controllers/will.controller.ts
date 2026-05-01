import { Request, Response } from 'express';
import { effectivePullAmountService } from '../services/effectivePullAmount';
import { prisma } from '../config/db';

function checkDatabaseConnection(res: Response): boolean {
  const dbConnected = (global as any).dbConnected || false;
  if (!dbConnected) {
    res.status(503).json({
      error: 'Database unavailable. Please check your DATABASE_URL configuration.',
      hint: 'For testing without a database, use mock endpoints.',
    });
    return false;
  }
  return true;
}

export async function getWillDetails(req: Request, res: Response) {
  if (!checkDatabaseConnection(res)) return;

  try {
    const rawWillId = req.params.willId;
    if (!rawWillId || Array.isArray(rawWillId)) {
      return res.status(400).json({ error: 'Invalid willId' });
    }

    const willId = rawWillId;
    const will = await prisma.will.findUnique({
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
  } catch (error) {
    console.error('[WillController] Error fetching will:', error);
    return res.status(500).json({ error: 'Failed to fetch will' });
  }
}

export async function refreshEffectivePullAmount(req: Request, res: Response) {
  if (!checkDatabaseConnection(res)) return;

  try {
    const rawWillId = req.params.willId;
    if (!rawWillId || Array.isArray(rawWillId)) {
      return res.status(400).json({ error: 'Invalid willId' });
    }

    const willId = rawWillId;
    const will = await prisma.will.findUnique({
      where: { id: willId },
    });

    if (!will) {
      return res.status(404).json({ error: 'Will not found' });
    }

    const newAmount = await effectivePullAmountService.updateWillById(willId);
    if (newAmount === null) {
      return res.status(500).json({ error: 'Failed to update effective amount' });
    }

    return res.json({
      message: 'Effective pull amount updated',
      effectivePullAmount: newAmount,
    });
  } catch (error) {
    console.error('[WillController] Error refreshing effective amount:', error);
    return res.status(500).json({ error: 'Failed to refresh effective amount' });
  }
}

export async function getApprovalHistory(req: Request, res: Response) {
  if (!checkDatabaseConnection(res)) return;

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

    const approvals = await prisma.erc20Approval.findMany({
      where: { willId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.erc20Approval.count({
      where: { willId },
    });

    return res.json({
      approvals,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[WillController] Error fetching approval history:', error);
    return res.status(500).json({ error: 'Failed to fetch approval history' });
  }
}
