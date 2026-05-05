import { Router } from 'express';
import { getBeneficiaryClaims } from '../controllers/will.controller';

const router = Router();

router.get('/:walletAddress/claims', getBeneficiaryClaims);

export default router;
