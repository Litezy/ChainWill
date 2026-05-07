import dotenv from 'dotenv';
import { mailerService } from '../services/mailerService';

dotenv.config();

const recipientEmail = process.argv[2] || 'habeebmusab@gmail.com';
const contractAddress = '0x1234567890abcdef1234567890abcdef12345678';
const ownerName = 'Habeeb Musab';

async function main(): Promise<void> {
  console.log(`[EmailTest] Sending sample emails to ${recipientEmail}`);
  console.log(
    `[EmailTest] Delivery mode: ${process.env.SMTP_HOST ? 'smtp' : 'preview'}`
  );

  await mailerService.sendOwnerWillCreatedEmail({
    ownerName,
    ownerEmail: recipientEmail,
    contractAddress,
    dashboardUrl: `${process.env.APP_FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
    explorerUrl: `https://sepolia.etherscan.io/address/${contractAddress}`,
  });

  await mailerService.sendSignerReminderEmail({
    signerName: 'Habeeb Musab',
    signerEmail: recipientEmail,
    ownerName,
    contractAddress,
    attestationWindowLabel: 'Opens immediately and remains active for 24 hours',
  });

  await mailerService.sendBeneficiaryClaimEmail({
    beneficiaryName: 'Habeeb Musab',
    beneficiaryEmail: recipientEmail,
    ownerName,
    allocationPercentage: 35,
    contractAddress,
  });

  await mailerService.sendVerificationOtpEmail({
    recipientName: 'Habeeb Musab',
    recipientEmail: recipientEmail,
    audience: 'signer',
    otpCode: '482951',
    expiresInMinutes: 10,
    contractAddress,
    verificationPageUrl: `${process.env.APP_FRONTEND_URL || 'http://localhost:5173'}/sign-inheritance?email=${encodeURIComponent(recipientEmail)}`,
    purpose: 'Signer email verification for inheritance attestation',
  });

  await mailerService.sendVerificationOtpEmail({
    recipientName: 'Habeeb Musab',
    recipientEmail: recipientEmail,
    audience: 'beneficiary',
    otpCode: '731864',
    expiresInMinutes: 10,
    contractAddress,
    verificationPageUrl: `${
      process.env.APP_FRONTEND_URL || 'http://localhost:5173'
    }/claim-inheritance/${encodeURIComponent(recipientEmail)}`,
    purpose: 'Beneficiary email verification for inheritance claim',
  });

  console.log('[EmailTest] Completed.');
}

main().catch((error) => {
  console.error('[EmailTest] Failed to send sample emails.');
  console.error(error);
  process.exit(1);
});
