import { Router } from 'express';
import {
  getWillBeneficiaries,
  getWillByAddress,
  getWillDetails,
  getWillsByOwner,
  getWillSigners,
  getWillStatus,
  refreshEffectivePullAmount,
  getApprovalHistory,
} from '../controllers/will.controller';

const router = Router();

router.get('/address/:willAddress/status', getWillStatus);
router.get('/address/:willAddress', getWillByAddress);

router.get('/id/:willId/approval-history', getApprovalHistory);

router.post('/id/:willId/refresh-effective-amount', refreshEffectivePullAmount);

router.get('/:willAddress/beneficiaries', getWillBeneficiaries);
router.get('/:willAddress/signers', getWillSigners);

router.get('/id/:willId', getWillDetails);
router.get('/:ownerAddress', getWillsByOwner);

export default router;
