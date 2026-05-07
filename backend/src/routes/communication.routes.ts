import { Router } from 'express';
import {
  sendNotificationEmail,
  sendOtp,
  verifyOtp,
} from '../controllers/communication.controller';
import { createBasicRateLimit } from '../middleware/basicRateLimit';

const router = Router();

const notificationRateLimit = createBasicRateLimit({
  windowMs: 10 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many notification email requests. Please try again later.',
});

const otpRateLimit = createBasicRateLimit({
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many OTP requests. Please try again later.',
});

router.post('/notifications/email', notificationRateLimit, sendNotificationEmail);
router.post('/otp/send', otpRateLimit, sendOtp);
router.post('/otp/verify', verifyOtp);

export default router;
