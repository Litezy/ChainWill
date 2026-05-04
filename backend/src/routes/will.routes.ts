import { Router } from 'express';
import {
  getWillDetails,
  refreshEffectivePullAmount,
  getApprovalHistory,
  notifyWillOwner,
} from '../controllers/will.controller';

const router = Router();

// Get 
router.get('/:willId/approval-history', getApprovalHistory);

router.post('/:willId/refresh-effective-amount', refreshEffectivePullAmount);

router.post('/:willAddress/notify', notifyWillOwner);

router.get('/:willId', getWillDetails);

export default router;
