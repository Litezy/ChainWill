import { createHash, randomBytes } from 'crypto';
import { prisma } from '../config/db';
import type { VerificationAudience } from '../types/email';

export const OTP_TTL_SECONDS = 10 * 60;

type VerifyOtpResult = 'valid' | 'invalid' | 'expired';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function generateOtpSalt(): string {
  return randomBytes(16).toString('hex');
}

function hashOtp(otp: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${otp}`, 'utf8').digest('hex');
}

export class OtpVerificationService {
  async saveOtp(
    email: string,
    audience: VerificationAudience,
    otpCode: string
  ): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    const otpSalt = generateOtpSalt();
    const otpHash = hashOtp(otpCode, otpSalt);
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

    await prisma.otpVerification.upsert({
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

  async verifyOtp(email: string, otpCode: string): Promise<VerifyOtpResult> {
    const normalizedEmail = normalizeEmail(email);
    const record = await prisma.otpVerification.findUnique({
      where: { email: normalizedEmail },
    });

    if (!record) {
      return 'expired';
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      await prisma.otpVerification.delete({
        where: { email: normalizedEmail },
      });
      return 'expired';
    }

    const candidateHash = hashOtp(otpCode, record.otpSalt);
    if (candidateHash !== record.otpHash) {
      return 'invalid';
    }

    await prisma.otpVerification.delete({
      where: { email: normalizedEmail },
    });

    return 'valid';
  }

  async deleteOtp(email: string): Promise<void> {
    await prisma.otpVerification.deleteMany({
      where: { email: normalizeEmail(email) },
    });
  }
}

export const otpVerificationService = new OtpVerificationService();
