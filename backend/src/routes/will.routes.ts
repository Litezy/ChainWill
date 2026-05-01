import { Router } from 'express';
import {
  getWillDetails,
  refreshEffectivePullAmount,
  getApprovalHistory,
} from '../controllers/will.controller';

const router = Router();

// Get 
router.get('/:willId/approval-history', getApprovalHistory);

router.post('/:willId/refresh-effective-amount', refreshEffectivePullAmount);

router.get('/:willId', getWillDetails);

export default router;
