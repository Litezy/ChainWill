import { Router } from 'express';
import { getSignerWills } from '../controllers/will.controller';

const router = Router();

router.get('/:walletAddress/wills', getSignerWills);

export default router;
