"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationEmail = sendNotificationEmail;
exports.sendOtp = sendOtp;
exports.verifyOtp = verifyOtp;
const crypto_1 = require("crypto");
const mailerService_1 = require("../services/mailerService");
const otpVerification_service_1 = require("../services/otpVerification.service");
class ValidationError extends Error {
}
function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function requireBody(body) {
    if (!isObject(body)) {
        throw new ValidationError('Request body must be a JSON object');
    }
    return body;
}
function requireString(value, fieldName, options) {
    if (typeof value !== 'string') {
        throw new ValidationError(`${fieldName} must be a string`);
    }
    const normalized = value.trim();
    if (!options?.allowEmpty && normalized.length === 0) {
        throw new ValidationError(`${fieldName} is required`);
    }
    return normalized;
}
function optionalString(value, fieldName) {
    if (value === undefined) {
        return undefined;
    }
    return requireString(value, fieldName);
}
function requireEmail(value, fieldName) {
    const email = requireString(value, fieldName).toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        throw new ValidationError(`${fieldName} must be a valid email address`);
    }
    return email;
}
function optionalEmail(value, fieldName) {
    if (value === undefined) {
        return undefined;
    }
    return requireEmail(value, fieldName);
}
function requireUrl(value, fieldName) {
    const rawUrl = requireString(value, fieldName);
    try {
        return new URL(rawUrl).toString();
    }
    catch {
        throw new ValidationError(`${fieldName} must be a valid URL`);
    }
}
function optionalUrl(value, fieldName) {
    if (value === undefined) {
        return undefined;
    }
    return requireUrl(value, fieldName);
}
function requireContractAddress(value, fieldName) {
    const contractAddress = requireString(value, fieldName);
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
        throw new ValidationError(`${fieldName} must be a valid EVM address`);
    }
    return contractAddress;
}
function optionalContractAddress(value, fieldName) {
    if (value === undefined) {
        return undefined;
    }
    return requireContractAddress(value, fieldName);
}
function requireNotificationType(value) {
    const type = requireString(value, 'type');
    if (type !== 'owner' && type !== 'beneficiary' && type !== 'signer') {
        throw new ValidationError("type must be one of: 'owner', 'beneficiary', 'signer'");
    }
    return type;
}
function requireAudience(value) {
    const audience = requireString(value, 'audience');
    if (audience !== 'signer' && audience !== 'beneficiary') {
        throw new ValidationError("audience must be either 'signer' or 'beneficiary'");
    }
    return audience;
}
function requireAllocation(value) {
    if (typeof value === 'number') {
        if (!Number.isFinite(value) || value <= 0) {
            throw new ValidationError('allocationPercentage must be a positive number or percentage string');
        }
        return value;
    }
    if (typeof value === 'string') {
        const normalized = value.trim();
        const percentagePattern = /^\d+(\.\d+)?%?$/;
        if (!percentagePattern.test(normalized)) {
            throw new ValidationError('allocationPercentage must be a positive number or percentage string');
        }
        const numericValue = Number.parseFloat(normalized.replace('%', ''));
        if (!Number.isFinite(numericValue) || numericValue <= 0) {
            throw new ValidationError('allocationPercentage must be a positive number or percentage string');
        }
        return normalized;
    }
    throw new ValidationError('allocationPercentage must be a positive number or percentage string');
}
function maskEmail(email) {
    const [localPart, domain = ''] = email.split('@');
    if (localPart.length <= 2) {
        return `${localPart[0] || '*'}*@${domain}`;
    }
    return `${localPart.slice(0, 2)}***@${domain}`;
}
function deriveRecipientName(email) {
    const localPart = email.split('@')[0] || 'Recipient';
    return localPart.replace(/[._-]+/g, ' ').trim() || 'Recipient';
}
function generateOtpCode() {
    return (0, crypto_1.randomInt)(0, 1_000_000).toString().padStart(6, '0');
}
function isDatabaseConnected() {
    return Boolean(global.dbConnected);
}
function ensureDatabaseConnection(res) {
    if (isDatabaseConnected()) {
        return true;
    }
    res.status(503).json({
        error: 'Database unavailable. OTP operations are temporarily unavailable.',
    });
    return false;
}
function validateNotificationPayload(body) {
    const payload = requireBody(body);
    const type = requireNotificationType(payload.type);
    if (type === 'owner') {
        return {
            type,
            ownerName: requireString(payload.ownerName, 'ownerName'),
            ownerEmail: requireEmail(payload.ownerEmail, 'ownerEmail'),
            contractAddress: requireContractAddress(payload.contractAddress, 'contractAddress'),
            dashboardUrl: optionalUrl(payload.dashboardUrl, 'dashboardUrl'),
            explorerUrl: optionalUrl(payload.explorerUrl, 'explorerUrl'),
            supportEmail: optionalEmail(payload.supportEmail, 'supportEmail'),
        };
    }
    if (type === 'beneficiary') {
        return {
            type,
            beneficiaryName: requireString(payload.beneficiaryName, 'beneficiaryName'),
            beneficiaryEmail: requireEmail(payload.beneficiaryEmail, 'beneficiaryEmail'),
            ownerName: requireString(payload.ownerName, 'ownerName'),
            allocationPercentage: requireAllocation(payload.allocationPercentage),
            contractAddress: requireContractAddress(payload.contractAddress, 'contractAddress'),
            claimPageUrl: optionalUrl(payload.claimPageUrl, 'claimPageUrl'),
            supportEmail: optionalEmail(payload.supportEmail, 'supportEmail'),
        };
    }
    return {
        type,
        signerName: requireString(payload.signerName, 'signerName'),
        signerEmail: requireEmail(payload.signerEmail, 'signerEmail'),
        ownerName: requireString(payload.ownerName, 'ownerName'),
        contractAddress: requireContractAddress(payload.contractAddress, 'contractAddress'),
        signingPageUrl: optionalUrl(payload.signingPageUrl, 'signingPageUrl'),
        attestationWindowLabel: optionalString(payload.attestationWindowLabel, 'attestationWindowLabel'),
        supportEmail: optionalEmail(payload.supportEmail, 'supportEmail'),
    };
}
function validateSendOtpPayload(body) {
    const payload = requireBody(body);
    return {
        email: requireEmail(payload.email, 'email'),
        audience: requireAudience(payload.audience),
        recipientName: optionalString(payload.recipientName, 'recipientName'),
        contractAddress: optionalContractAddress(payload.contractAddress, 'contractAddress'),
        purpose: optionalString(payload.purpose, 'purpose'),
        verificationPageUrl: optionalUrl(payload.verificationPageUrl, 'verificationPageUrl'),
        supportEmail: optionalEmail(payload.supportEmail, 'supportEmail'),
    };
}
function validateVerifyOtpPayload(body) {
    const payload = requireBody(body);
    const otp = requireString(payload.otp, 'otp');
    if (!/^\d{6}$/.test(otp)) {
        throw new ValidationError('otp must be a 6-digit code');
    }
    return {
        email: requireEmail(payload.email, 'email'),
        otp,
    };
}
function handleControllerError(res, error, fallbackMessage) {
    if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
    }
    console.error(`[CommunicationController] ${fallbackMessage}:`, error);
    return res.status(500).json({ error: fallbackMessage });
}
async function sendNotificationEmail(req, res) {
    try {
        const payload = validateNotificationPayload(req.body);
        if (payload.type === 'owner') {
            await mailerService_1.mailerService.sendOwnerWillCreatedEmail(payload);
        }
        else if (payload.type === 'beneficiary') {
            await mailerService_1.mailerService.sendBeneficiaryClaimEmail(payload);
        }
        else {
            await mailerService_1.mailerService.sendSignerReminderEmail(payload);
        }
        return res.status(200).json({
            message: 'Notification email sent successfully',
            type: payload.type,
            contractAddress: payload.contractAddress,
        });
    }
    catch (error) {
        return handleControllerError(res, error, 'Failed to send notification email');
    }
}
async function sendOtp(req, res) {
    if (!ensureDatabaseConnection(res)) {
        return res;
    }
    try {
        const payload = validateSendOtpPayload(req.body);
        const otpCode = generateOtpCode();
        await otpVerification_service_1.otpVerificationService.saveOtp(payload.email, payload.audience, otpCode);
        try {
            await mailerService_1.mailerService.sendVerificationOtpEmail({
                recipientName: payload.recipientName || deriveRecipientName(payload.email),
                recipientEmail: payload.email,
                audience: payload.audience,
                otpCode,
                expiresInMinutes: otpVerification_service_1.OTP_TTL_SECONDS / 60,
                contractAddress: payload.contractAddress,
                verificationPageUrl: payload.verificationPageUrl,
                purpose: payload.purpose,
                supportEmail: payload.supportEmail,
            });
        }
        catch (error) {
            await otpVerification_service_1.otpVerificationService.deleteOtp(payload.email);
            throw error;
        }
        return res.status(200).json({
            message: 'OTP sent successfully',
            audience: payload.audience,
            email: maskEmail(payload.email),
            expiresInSeconds: otpVerification_service_1.OTP_TTL_SECONDS,
        });
    }
    catch (error) {
        return handleControllerError(res, error, 'Failed to send OTP');
    }
}
async function verifyOtp(req, res) {
    if (!ensureDatabaseConnection(res)) {
        return res;
    }
    try {
        const payload = validateVerifyOtpPayload(req.body);
        const verificationResult = await otpVerification_service_1.otpVerificationService.verifyOtp(payload.email, payload.otp);
        if (verificationResult === 'expired') {
            return res.status(410).json({
                error: 'OTP expired or not found',
            });
        }
        if (verificationResult === 'invalid') {
            return res.status(400).json({
                error: 'Invalid OTP code',
            });
        }
        return res.status(200).json({
            message: 'OTP verified successfully',
            email: maskEmail(payload.email),
        });
    }
    catch (error) {
        return handleControllerError(res, error, 'Failed to verify OTP');
    }
}
