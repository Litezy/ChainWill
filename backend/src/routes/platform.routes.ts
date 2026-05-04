import { Router } from 'express';
import { getPlatformStats } from '../controllers/platform.controller';

const router = Router();

router.get('/stats', getPlatformStats);

export default router;
