"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpVerificationService = exports.OtpVerificationService = exports.OTP_TTL_SECONDS = void 0;
const crypto_1 = require("crypto");
const db_1 = require("../config/db");
exports.OTP_TTL_SECONDS = 10 * 60;
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
function generateOtpSalt() {
    return (0, crypto_1.randomBytes)(16).toString('hex');
}
function hashOtp(otp, salt) {
    return (0, crypto_1.createHash)('sha256').update(`${salt}:${otp}`, 'utf8').digest('hex');
}
class OtpVerificationService {
    async saveOtp(email, audience, otpCode) {
        const normalizedEmail = normalizeEmail(email);
        const otpSalt = generateOtpSalt();
        const otpHash = hashOtp(otpCode, otpSalt);
        const expiresAt = new Date(Date.now() + exports.OTP_TTL_SECONDS * 1000);
        await db_1.prisma.otpVerification.upsert({
            where: { email: normalizedEmail },
            update: {
                audience,
                otpHash,
                otpSalt,
                expiresAt,
            },
            create: {
                email: normalizedEmail,
                audience,
                otpHash,
                otpSalt,
                expiresAt,
            },
        });
    }
    async verifyOtp(email, otpCode) {
        const normalizedEmail = normalizeEmail(email);
        const record = await db_1.prisma.otpVerification.findUnique({
            where: { email: normalizedEmail },
        });
        if (!record) {
            return 'expired';
        }
        if (record.expiresAt.getTime() <= Date.now()) {
            await db_1.prisma.otpVerification.delete({
                where: { email: normalizedEmail },
            });
            return 'expired';
        }
        const candidateHash = hashOtp(otpCode, record.otpSalt);
        if (candidateHash !== record.otpHash) {
            return 'invalid';
        }
        await db_1.prisma.otpVerification.delete({
            where: { email: normalizedEmail },
        });
        return 'valid';
    }
    async deleteOtp(email) {
        await db_1.prisma.otpVerification.deleteMany({
            where: { email: normalizeEmail(email) },
        });
    }
}
exports.OtpVerificationService = OtpVerificationService;
exports.otpVerificationService = new OtpVerificationService();
