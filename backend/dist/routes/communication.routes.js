"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const communication_controller_1 = require("../controllers/communication.controller");
const basicRateLimit_1 = require("../middleware/basicRateLimit");
const router = (0, express_1.Router)();
const notificationRateLimit = (0, basicRateLimit_1.createBasicRateLimit)({
    windowMs: 10 * 60 * 1000,
    maxRequests: 10,
    message: 'Too many notification email requests. Please try again later.',
});
const otpRateLimit = (0, basicRateLimit_1.createBasicRateLimit)({
    windowMs: 10 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many OTP requests. Please try again later.',
});
router.post('/notifications/email', notificationRateLimit, communication_controller_1.sendNotificationEmail);
router.post('/otp/send', otpRateLimit, communication_controller_1.sendOtp);
router.post('/otp/verify', communication_controller_1.verifyOtp);
exports.default = router;
