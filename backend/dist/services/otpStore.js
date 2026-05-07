"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpStore = exports.OTP_TTL_SECONDS = void 0;
const redis_1 = require("../config/redis");
const OTP_KEY_PREFIX = 'chainwill:otp';
exports.OTP_TTL_SECONDS = 10 * 60;
function getOtpKey(email) {
    return `${OTP_KEY_PREFIX}:${email.trim().toLowerCase()}`;
}
class OtpStoreService {
    redis = (0, redis_1.createRedisConnection)();
    constructor() {
        this.redis.on('error', (error) => {
            console.error('[OtpStore] Redis connection error:', error);
        });
    }
    async setOtp(email, otp) {
        await this.redis.set(getOtpKey(email), otp, 'EX', exports.OTP_TTL_SECONDS);
    }
    async getOtp(email) {
        return this.redis.get(getOtpKey(email));
    }
    async deleteOtp(email) {
        await this.redis.del(getOtpKey(email));
    }
    async close() {
        await this.redis.quit();
    }
}
exports.otpStore = new OtpStoreService();
