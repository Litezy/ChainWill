import { randomInt } from "crypto";
import type { Request, Response } from "express";
import { mailerService } from "../services/mailerService";
import {
  OTP_TTL_SECONDS,
  otpVerificationService,
} from "../services/otpVerification.service";
import type { VerificationAudience } from "../types/email";

type NotificationType = "owner" | "beneficiary" | "signer";

interface OwnerNotificationRequest {
  type: "owner";
  ownerName: string;
  ownerEmail: string;
  contractAddress: string;
  dashboardUrl?: string;
  explorerUrl?: string;
  supportEmail?: string;
}

interface BeneficiaryNotificationRequest {
  type: "beneficiary";
  beneficiaries: {
    beneficiaryName: string;
    beneficiaryEmail: string;
    allocationPercentage: number | string;
  }[];
  ownerName: string;
  contractAddress: string;
  claimPageUrl?: string;
  supportEmail?: string;
}

interface SignerNotificationRequest {
  type: "signer";
  signers: {
    signerName: string;
    signerEmail: string;
  }[];
  ownerName: string;
  contractAddress: string;
  signingPageUrl?: string;
  attestationWindowLabel?: string;
  supportEmail?: string;
}

type NotificationRequestBody =
  | OwnerNotificationRequest
  | BeneficiaryNotificationRequest
  | SignerNotificationRequest;

interface SendOtpRequestBody {
  email: string;
  audience: VerificationAudience;
  recipientName?: string;
  contractAddress?: string;
  purpose?: string;
  verificationPageUrl?: string;
  supportEmail?: string;
}

interface VerifyOtpRequestBody {
  email: string;
  otp: string;
}

class ValidationError extends Error {}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireBody(body: unknown): Record<string, unknown> {
  if (!isObject(body)) {
    throw new ValidationError("Request body must be a JSON object");
  }

  return body;
}

function requireString(
  value: unknown,
  fieldName: string,
  options?: {
    allowEmpty?: boolean;
  },
): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  const normalized = value.trim();
  if (!options?.allowEmpty && normalized.length === 0) {
    throw new ValidationError(`${fieldName} is required`);
  }

  return normalized;
}

function optionalString(value: unknown, fieldName: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return requireString(value, fieldName);
}

function requireEmail(value: unknown, fieldName: string): string {
  const email = requireString(value, fieldName).toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new ValidationError(`${fieldName} must be a valid email address`);
  }

  return email;
}

function optionalEmail(value: unknown, fieldName: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return requireEmail(value, fieldName);
}

function requireUrl(value: unknown, fieldName: string): string {
  const rawUrl = requireString(value, fieldName);

  try {
    return new URL(rawUrl).toString();
  } catch {
    throw new ValidationError(`${fieldName} must be a valid URL`);
  }
}

function optionalUrl(value: unknown, fieldName: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return requireUrl(value, fieldName);
}

function requireContractAddress(value: unknown, fieldName: string): string {
  const contractAddress = requireString(value, fieldName);

  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
    throw new ValidationError(`${fieldName} must be a valid EVM address`);
  }

  return contractAddress;
}

function optionalContractAddress(
  value: unknown,
  fieldName: string,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return requireContractAddress(value, fieldName);
}

function requireNotificationType(value: unknown): NotificationType {
  const type = requireString(value, "type");

  if (type !== "owner" && type !== "beneficiary" && type !== "signer") {
    throw new ValidationError(
      "type must be one of: 'owner', 'beneficiary', 'signer'",
    );
  }

  return type;
}

function requireAudience(value: unknown): VerificationAudience {
  const audience = requireString(value, "audience");

  if (audience !== "signer" && audience !== "beneficiary") {
    throw new ValidationError(
      "audience must be either 'signer' or 'beneficiary'",
    );
  }

  return audience;
}

function requireAllocation(value: unknown): number | string {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) {
      throw new ValidationError(
        "allocationPercentage must be a positive number or percentage string",
      );
    }

    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    const percentagePattern = /^\d+(\.\d+)?%?$/;

    if (!percentagePattern.test(normalized)) {
      throw new ValidationError(
        "allocationPercentage must be a positive number or percentage string",
      );
    }

    const numericValue = Number.parseFloat(normalized.replace("%", ""));
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      throw new ValidationError(
        "allocationPercentage must be a positive number or percentage string",
      );
    }

    return normalized;
  }

  throw new ValidationError(
    "allocationPercentage must be a positive number or percentage string",
  );
}

function maskEmail(email: string): string {
  const [localPart, domain = ""] = email.split("@");

  if (localPart.length <= 2) {
    return `${localPart[0] || "*"}*@${domain}`;
  }

  return `${localPart.slice(0, 2)}***@${domain}`;
}

function deriveRecipientName(email: string): string {
  const localPart = email.split("@")[0] || "Recipient";
  return localPart.replace(/[._-]+/g, " ").trim() || "Recipient";
}

function generateOtpCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function isDatabaseConnected(): boolean {
  return Boolean((global as { dbConnected?: boolean }).dbConnected);
}

function ensureDatabaseConnection(res: Response): boolean {
  if (isDatabaseConnected()) {
    return true;
  }

  res.status(503).json({
    error: "Database unavailable. OTP operations are temporarily unavailable.",
  });
  return false;
}

function validateNotificationPayload(body: unknown): NotificationRequestBody {
  const payload = requireBody(body);
  const type = requireNotificationType(payload.type);

  if (type === "owner") {
    return {
      type,
      ownerName: requireString(payload.ownerName, "ownerName"),
      ownerEmail: requireEmail(payload.ownerEmail, "ownerEmail"),
      contractAddress: requireContractAddress(
        payload.contractAddress,
        "contractAddress",
      ),
      dashboardUrl: optionalUrl(payload.dashboardUrl, "dashboardUrl"),
      explorerUrl: optionalUrl(payload.explorerUrl, "explorerUrl"),
      supportEmail: optionalEmail(payload.supportEmail, "supportEmail"),
    };
  }

  if (type === "beneficiary") {
    if (!Array.isArray(payload.beneficiaries)) {
      throw new ValidationError("beneficiaries must be an array");
    }

    return {
      type,
      beneficiaries: payload.beneficiaries.map((beneficiary, index) => {
        if (!isObject(beneficiary)) {
          throw new ValidationError(
            `beneficiaries[${index}] must be an object`,
          );
        }

        return {
          beneficiaryName: requireString(
            beneficiary.beneficiaryName,
            `beneficiaries[${index}].beneficiaryName`,
          ),

          beneficiaryEmail: requireEmail(
            beneficiary.beneficiaryEmail,
            `beneficiaries[${index}].beneficiaryEmail`,
          ),

          allocationPercentage: requireAllocation(
            beneficiary.allocationPercentage,
          ),
        };
      }),

      ownerName: requireString(payload.ownerName, "ownerName"),

      contractAddress: requireContractAddress(
        payload.contractAddress,
        "contractAddress",
      ),

      claimPageUrl: optionalUrl(payload.claimPageUrl, "claimPageUrl"),

      supportEmail: optionalEmail(payload.supportEmail, "supportEmail"),
    };
  }

  if (!Array.isArray(payload.signers)) {
    throw new ValidationError("signers must be an array");
  }

  return {
    type,

    signers: payload.signers.map((signer, index) => {
      if (!isObject(signer)) {
        throw new ValidationError(`signers[${index}] must be an object`);
      }

      return {
        signerName: requireString(
          signer.signerName,
          `signers[${index}].signerName`,
        ),

        signerEmail: requireEmail(
          signer.signerEmail,
          `signers[${index}].signerEmail`,
        ),
      };
    }),

    ownerName: requireString(payload.ownerName, "ownerName"),

    contractAddress: requireContractAddress(
      payload.contractAddress,
      "contractAddress",
    ),

    signingPageUrl: optionalUrl(payload.signingPageUrl, "signingPageUrl"),

    attestationWindowLabel: optionalString(
      payload.attestationWindowLabel,
      "attestationWindowLabel",
    ),

    supportEmail: optionalEmail(payload.supportEmail, "supportEmail"),
  };
}

function validateSendOtpPayload(body: unknown): SendOtpRequestBody {
  const payload = requireBody(body);

  return {
    email: requireEmail(payload.email, "email"),
    audience: requireAudience(payload.audience),
    recipientName: optionalString(payload.recipientName, "recipientName"),
    contractAddress: optionalContractAddress(
      payload.contractAddress,
      "contractAddress",
    ),
    purpose: optionalString(payload.purpose, "purpose"),
    verificationPageUrl: optionalUrl(
      payload.verificationPageUrl,
      "verificationPageUrl",
    ),
    supportEmail: optionalEmail(payload.supportEmail, "supportEmail"),
  };
}

function validateVerifyOtpPayload(body: unknown): VerifyOtpRequestBody {
  const payload = requireBody(body);
  const otp = requireString(payload.otp, "otp");

  if (!/^\d{6}$/.test(otp)) {
    throw new ValidationError("otp must be a 6-digit code");
  }

  return {
    email: requireEmail(payload.email, "email"),
    otp,
  };
}

function handleControllerError(
  res: Response,
  error: unknown,
  fallbackMessage: string,
): Response {
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }

  console.error(`[CommunicationController] ${fallbackMessage}:`, error);
  return res.status(500).json({ error: fallbackMessage });
}

export async function sendNotificationEmail(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const payload = validateNotificationPayload(req.body);

    if (payload.type === "owner") {
      await mailerService.sendOwnerWillCreatedEmail(payload);
    } else if (payload.type === "beneficiary") {
      await Promise.all(
        payload.beneficiaries.map((beneficiary) =>
          mailerService.sendBeneficiaryClaimEmail({
            ...beneficiary,
            ownerName: payload.ownerName,
            contractAddress: payload.contractAddress,
            claimPageUrl: payload.claimPageUrl,
            supportEmail: payload.supportEmail,
          }),
        ),
      );
    } else {
      await Promise.all(
        payload.signers.map((signer) =>
          mailerService.sendSignerReminderEmail({
            ...signer,
            ownerName: payload.ownerName,
            contractAddress: payload.contractAddress,
            signingPageUrl: payload.signingPageUrl,
            attestationWindowLabel: payload.attestationWindowLabel,
            supportEmail: payload.supportEmail,
          }),
        ),
      );
    }

    return res.status(200).json({
      message: "Notification email sent successfully",
      type: payload.type,
      contractAddress: payload.contractAddress,
    });
  } catch (error) {
    return handleControllerError(
      res,
      error,
      "Failed to send notification email",
    );
  }
}

export async function sendOtp(req: Request, res: Response): Promise<Response> {
  if (!ensureDatabaseConnection(res)) {
    return res;
  }

  try {
    const payload = validateSendOtpPayload(req.body);
    const otpCode = generateOtpCode();

    await otpVerificationService.saveOtp(
      payload.email,
      payload.audience,
      otpCode,
    );

    try {
      await mailerService.sendVerificationOtpEmail({
        recipientName:
          payload.recipientName || deriveRecipientName(payload.email),
        recipientEmail: payload.email,
        audience: payload.audience,
        otpCode,
        expiresInMinutes: OTP_TTL_SECONDS / 60,
        contractAddress: payload.contractAddress,
        verificationPageUrl: payload.verificationPageUrl,
        purpose: payload.purpose,
        supportEmail: payload.supportEmail,
      });
    } catch (error) {
      await otpVerificationService.deleteOtp(payload.email);
      throw error;
    }

    return res.status(200).json({
      message: "OTP sent successfully",
      audience: payload.audience,
      email: maskEmail(payload.email),
      expiresInSeconds: OTP_TTL_SECONDS,
    });
  } catch (error) {
    return handleControllerError(res, error, "Failed to send OTP");
  }
}

export async function verifyOtp(
  req: Request,
  res: Response,
): Promise<Response> {
  if (!ensureDatabaseConnection(res)) {
    return res;
  }

  try {
    const payload = validateVerifyOtpPayload(req.body);
    const verificationResult = await otpVerificationService.verifyOtp(
      payload.email,
      payload.otp,
    );

    if (verificationResult === "expired") {
      return res.status(410).json({
        error: "OTP expired or not found",
      });
    }

    if (verificationResult === "invalid") {
      return res.status(400).json({
        error: "Invalid OTP code",
      });
    }

    return res.status(200).json({
      message: "OTP verified successfully",
      email: maskEmail(payload.email),
    });
  } catch (error) {
    return handleControllerError(res, error, "Failed to verify OTP");
  }
}
