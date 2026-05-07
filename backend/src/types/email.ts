export interface RenderedEmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface OwnerWillCreatedEmailInput {
  ownerName: string;
  ownerEmail: string;
  contractAddress: string;
  dashboardUrl?: string;
  explorerUrl?: string;
  supportEmail?: string;
}

export interface SignerReminderEmailInput {
  signerName: string;
  signerEmail: string;
  ownerName: string;
  contractAddress: string;
  signingPageUrl?: string;
  attestationWindowLabel?: string;
  supportEmail?: string;
}

export interface BeneficiaryClaimEmailInput {
  beneficiaryName: string;
  beneficiaryEmail: string;
  ownerName: string;
  allocationPercentage: number | string;
  contractAddress: string;
  claimPageUrl?: string;
  supportEmail?: string;
}

export type VerificationAudience = 'signer' | 'beneficiary';

export interface VerificationOtpEmailInput {
  recipientName: string;
  recipientEmail: string;
  audience: VerificationAudience;
  otpCode: string;
  expiresInMinutes: number;
  contractAddress?: string;
  verificationPageUrl?: string;
  purpose?: string;
  supportEmail?: string;
}

export interface SendMailInput extends RenderedEmailTemplate {
  to: string | string[];
  headers?: Record<string, string>;
}
