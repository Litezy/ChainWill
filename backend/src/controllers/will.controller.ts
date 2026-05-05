import { Request, Response } from 'express';
import { effectivePullAmountService } from '../services/effectivePullAmount';
import { prisma } from '../config/db';
import { willService } from '../services/will.service';

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

function handleControllerError(res: Response, error: unknown, fallback: string) {
  if (error instanceof Error && error.message.startsWith('Invalid ')) {
    return res.status(400).json({ error: error.message });
  }

  console.error(`[WillController] ${fallback}:`, error);
  return res.status(500).json({ error: fallback });
}

function paramValue(value: string | string[] | undefined, name: string): string {
  if (!value || Array.isArray(value)) {
    throw new Error(`Invalid ${name}`);
  }

  return value;
}

export async function getWillsByOwner(req: Request, res: Response) {
  if (!checkDatabaseConnection(res)) return;

  try {
    const wills = await willService.getWillsByOwner(paramValue(req.params.ownerAddress, 'ownerAddress'));
    return res.json(wills);
  } catch (error) {
    return handleControllerError(res, error, 'Failed to fetch owner wills');
  }
}

export async function getWillByAddress(req: Request, res: Response) {
  if (!checkDatabaseConnection(res)) return;

  try {
    const will = await willService.getWillByAddress(paramValue(req.params.willAddress, 'willAddress'));
    if (!will) {
      return res.status(404).json({ error: 'Will not found' });
    }

    return res.json(will);
  } catch (error) {
    return handleControllerError(res, error, 'Failed to fetch will');
  }
}

export async function getWillStatus(req: Request, res: Response) {
  if (!checkDatabaseConnection(res)) return;

  try {
    const status = await willService.getWillStatus(paramValue(req.params.willAddress, 'willAddress'));
    if (!status) {
      return res.status(404).json({ error: 'Will not found' });
    }

    return res.json(status);
  } catch (error) {
    return handleControllerError(res, error, 'Failed to fetch will status');
  }
}

export async function getWillBeneficiaries(req: Request, res: Response) {
  if (!checkDatabaseConnection(res)) return;

  try {
    const beneficiaries = await willService.getBeneficiaries(
      paramValue(req.params.willAddress, 'willAddress')
    );
    if (!beneficiaries) {
      return res.status(404).json({ error: 'Will not found' });
    }

    return res.json(beneficiaries);
  } catch (error) {
    return handleControllerError(res, error, 'Failed to fetch beneficiaries');
  }
}

export async function getWillSigners(req: Request, res: Response) {
  if (!checkDatabaseConnection(res)) return;

  try {
    const signers = await willService.getSigners(paramValue(req.params.willAddress, 'willAddress'));
    if (!signers) {
      return res.status(404).json({ error: 'Will not found' });
    }

    return res.json(signers);
  } catch (error) {
    return handleControllerError(res, error, 'Failed to fetch signers');
  }
}

export async function getBeneficiaryClaims(req: Request, res: Response) {
  if (!checkDatabaseConnection(res)) return;

  try {
    const claims = await willService.getClaimsByBeneficiary(
      paramValue(req.params.walletAddress, 'walletAddress')
    );
    return res.json(claims);
  } catch (error) {
    return handleControllerError(res, error, 'Failed to fetch beneficiary claims');
  }
}

export async function getSignerWills(req: Request, res: Response) {
  if (!checkDatabaseConnection(res)) return;

  try {
    const wills = await willService.getWillsBySigner(
      paramValue(req.params.walletAddress, 'walletAddress')
    );
    return res.json(wills);
  } catch (error) {
    return handleControllerError(res, error, 'Failed to fetch signer wills');
  }
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

function isValidAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export async function notifyWillOwner(req: Request, res: Response) {
  if (!checkDatabaseConnection(res)) return;

  try {
    const rawWillAddress = req.params.willAddress;
    if (!rawWillAddress || Array.isArray(rawWillAddress)) {
      return res.status(400).json({ error: 'Invalid willAddress' });
    }

    if (!isValidAddress(rawWillAddress)) {
      return res.status(400).json({ error: 'willAddress must be a valid EVM address' });
    }

    const will = await prisma.will.findFirst({
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

    const ownerEmail = alertDispatcher.resolveRecipientEmail({
      address: will.ownerAddress,
      email: will.ownerEmail,
    });

    if (!ownerEmail) {
      return res.status(400).json({
        error: 'Owner email is not available for this will',
      });
    }

    await notificationQueue.enqueue({
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
  } catch (error) {
    console.error('[WillController] Error queueing manual check-in reminder:', error);
    return res.status(500).json({ error: 'Failed to queue check-in reminder' });
  }
}
