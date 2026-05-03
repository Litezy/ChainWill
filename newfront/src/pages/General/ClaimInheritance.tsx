import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import CustomConnectButton from '@/components/CustomConnectButton';
import {
  dismissToast,
  errorMessage,
  loadingMessage,
  successMessage,
} from '@/utils/messageStatus';

type MockClaimRecord = {
  email: string;
  beneficiaryName: string;
  testatorName: string;
  testatorWallet: string;
  claimId: string;
  network: string;
  triggeredAt: string;
  otpCode: string;
  baseAmount: number;
  defaultPercentage: number;
};

type WalletClaimDetails = {
  amount: string;
  percentage: number;
};

const MOCK_CLAIMS: MockClaimRecord[] = [
  {
    email: 'ada@chainwill.xyz',
    beneficiaryName: 'Ada Johnson',
    testatorName: 'Alex Thompson',
    testatorWallet: '0x3d...f9a1',
    claimId: 'DT-928-XA',
    network: 'Sepolia Testnet',
    triggeredAt: '2 hours ago',
    otpCode: '248613',
    baseAmount: 24500,
    defaultPercentage: 35,
  },
  {
    email: 'james@chainwill.xyz',
    beneficiaryName: 'James Carter',
    testatorName: 'Maya Lopez',
    testatorWallet: '0x7b...8c44',
    claimId: 'DT-442-JC',
    network: 'Sepolia Testnet',
    triggeredAt: '5 hours ago',
    otpCode: '731204',
    baseAmount: 18000,
    defaultPercentage: 20,
  },
  {
    email: 'sarah@chainwill.xyz',
    beneficiaryName: 'Sarah Kim',
    testatorName: 'Daniel Wright',
    testatorWallet: '0xa1...e2bb',
    claimId: 'DT-119-SK',
    network: 'Sepolia Testnet',
    triggeredAt: '1 day ago',
    otpCode: '905117',
    baseAmount: 32000,
    defaultPercentage: 45,
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const formatAmount = (amount: number) =>
  amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const decodeEmailParam = (value?: string) => {
  if (!value) return null;

  try {
    return decodeURIComponent(value).trim().toLowerCase();
  } catch {
    return null;
  }
};

async function mockLookupClaim(email: string) {
  await delay(500);
  return MOCK_CLAIMS.find((claim) => claim.email === email) ?? null;
}

async function mockReadClaimFromContract(
  claim: MockClaimRecord,
  walletAddress: `0x${string}`,
): Promise<WalletClaimDetails> {
  await delay(800);

  const seed = Number.parseInt(walletAddress.slice(-6), 16);
  const variableAmount = Number.isNaN(seed) ? 0 : (seed % 9000) / 10;
  const variablePercentage = Number.isNaN(seed) ? 0 : seed % 6;

  return {
    amount: formatAmount(claim.baseAmount + variableAmount),
    percentage: Math.min(claim.defaultPercentage + variablePercentage, 100),
  };
}

const ClaimInheritance: React.FC = () => {
  const { email: emailParam } = useParams();
  const { address, isConnected } = useAccount();

  const [resolvedEmail, setResolvedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [claimRecord, setClaimRecord] = useState<MockClaimRecord | null>(null);
  const [walletClaim, setWalletClaim] = useState<WalletClaimDetails | null>(null);
  const [isReadingClaim, setIsReadingClaim] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);

  useEffect(() => {
    const decodedEmail = decodeEmailParam(emailParam);

    setResolvedEmail(decodedEmail);
    setIsLoading(true);
    setClaimRecord(null);
    setWalletClaim(null);
    setOtpInput('');
    setOtpSent(false);
    setOtpVerified(false);
    setIsClaimed(false);

    if (!decodedEmail) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadClaim = async () => {
      const claim = await mockLookupClaim(decodedEmail);

      if (cancelled) return;

      setClaimRecord(claim);
      setIsLoading(false);
    };

    loadClaim();

    return () => {
      cancelled = true;
    };
  }, [emailParam]);

  useEffect(() => {
    setWalletClaim(null);
    setIsClaimed(false);

    if (!claimRecord || !isConnected || !address) {
      setIsReadingClaim(false);
      return;
    }

    let cancelled = false;

    const loadWalletClaim = async () => {
      setIsReadingClaim(true);

      try {
        const contractClaim = await mockReadClaimFromContract(claimRecord, address);

        if (!cancelled) {
          setWalletClaim(contractClaim);
        }
      } catch {
        if (!cancelled) {
          errorMessage('Unable to load inheritance details for this wallet.');
        }
      } finally {
        if (!cancelled) {
          setIsReadingClaim(false);
        }
      }
    };

    loadWalletClaim();

    return () => {
      cancelled = true;
    };
  }, [address, claimRecord, isConnected]);

  const handleSendOtp = async () => {
    if (!claimRecord) return;

    const toastId = loadingMessage(`Sending OTP to ${claimRecord.email}...`);

    try {
      await delay(700);
      dismissToast(toastId);
      setOtpSent(true);
      successMessage(`Demo OTP sent. Use ${claimRecord.otpCode} for ${claimRecord.email}.`);
    } catch {
      dismissToast(toastId);
      errorMessage('Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!claimRecord) return;

    if (otpInput.trim() !== claimRecord.otpCode) {
      errorMessage('Invalid OTP. Use the demo code sent for this email.');
      return;
    }

    const toastId = loadingMessage('Verifying OTP...');

    try {
      await delay(600);
      dismissToast(toastId);
      setOtpVerified(true);
      successMessage('Email verified. You can now claim this inheritance.');
    } catch {
      dismissToast(toastId);
      errorMessage('OTP verification failed.');
    }
  };

  const handleClaimInheritance = async () => {
    if (!claimRecord || !walletClaim || !address) {
      errorMessage('Verify email and connect wallet before claiming.');
      return;
    }

    const toastId = loadingMessage('Submitting inheritance claim...');

    try {
      setIsClaiming(true);
      await delay(1200);
      dismissToast(toastId);
      setIsClaimed(true);
      successMessage(`Claim submitted for ${walletClaim.amount} USDC to ${address.slice(0, 6)}...${address.slice(-4)}.`);
    } catch {
      dismissToast(toastId);
      errorMessage('Claim submission failed.');
    } finally {
      setIsClaiming(false);
    }
  };

  const isNotFound = !isLoading && !claimRecord;
  const showConnectWallet = !!claimRecord && !isConnected;
  const showClaimButton =
    !!claimRecord && isConnected && !!walletClaim && otpVerified && !isReadingClaim && !isClaimed;

  const statusText = isLoading
    ? 'Checking'
    : isNotFound
      ? 'Not Found'
      : isClaimed
        ? 'Claim Submitted'
        : !isConnected
          ? 'Connect Wallet'
          : isReadingClaim
            ? 'Loading Claim'
            : !otpVerified
              ? 'Verification Required'
              : 'Ready';

  const amountLabel = isClaimed
    ? '240 USDC Claimed'
    : walletClaim
      ? `${walletClaim.amount} USDC`
    : isNotFound
      ? 'No inheritance record'
      : isConnected
        ? isReadingClaim
          ? 'Loading claim amount...'
          : 'No claimable amount found'
        : 'Connect wallet to load amount';

  const helperText = isNotFound
    ? 'The email in the claim link did not match any inheritance record.'
    : !claimRecord
      ? 'We are validating this inheritance link.'
      : !isConnected
        ? 'Connect the beneficiary wallet first to read the claim amount from contract.'
        : isReadingClaim
          ? 'Fetching amount and percentage from the smart contract.'
          : isClaimed
            ? 'This inheritance amount has already been claimed.'
            : !otpVerified
              ? `Wallet connected. Verify ${claimRecord.email} with OTP before claiming.`
              : `Wallet verified. Allocation loaded for ${walletClaim?.percentage ?? '--'}% share.`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow flex items-center justify-center px-gutter py-12">
        <div className="w-full max-w-2xl mx-auto">
          <div className="glass-card border border-slate-200 rounded-xl shadow-[0_20px_50px_rgba(2,16,100,0.04)] overflow-hidden">
            <div className="relative h-48 bg-primary-container overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-20">
                <img
                  alt="Blockchain visualization"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5W2ZNBszsuRqTfG7Djx_6NZmxSPcq3WoyrL_V19pfUBXNoflFYI6YhWjUf0fMKzclSGMXWNcYU63CutCQxpcB7MXZPAjzeGqg-IZm4hXbAS0O0IujQrJH-TvL0jId7vvm4Q5lQppafnZcGLEqOaLFKhU3SqPMjIR3wRhY5NPR9VKH_qLEFFPIP--JUVpdmOfyX4ppnb7JqLqfwmMY0td1UnYwXCp8iAvS6dZrhQlNeN-vEkIzuVcaYQMP_bAO7vSuiBEmfO1K61W_"
                />
              </div>
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-on-primary mb-4 shadow-lg">
                  <span
                    className="material-symbols-outlined text-primary text-4xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {isNotFound ? 'error' : 'lock_open'}
                  </span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border backdrop-blur-sm ${
                  isNotFound
                    ? 'bg-red-500/10 text-red-300 border-red-300/30'
                    : 'bg-green-500/10 text-[#4ade80] border-[#4ade80]/30'
                }`}>
                  Status: {statusText}
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12 text-center">
              <h1 className="font-display-lg text-display-lg text-primary mb-4">
                {isNotFound ? 'Page Not Found' : 'Claim Your Inheritance'}
              </h1>
              <p className="font-body-base text-on-surface-variant max-w-md mx-auto mb-8">
                {isNotFound
                  ? helperText
                  : 'The Digital Notary has confirmed the trigger conditions for the following testament.'}
              </p>

              <div className="bg-surface-container-low rounded-xl p-6 mb-8 border border-outline-variant/30">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                    <span className="font-label-bold text-label-bold text-outline uppercase">
                      From Testator
                    </span>
                    <span className="font-nav-item text-nav-item text-primary font-bold">
                      {claimRecord ? `${claimRecord.testatorWallet} (${claimRecord.testatorName})` : 'No matching record'}
                    </span>
                  </div>

                  <div className="py-4">
                    <span className="font-label-bold text-label-bold text-outline uppercase block mb-2">
                      Claimable Amount
                    </span>
                    <div className="font-display-lg text-display-lg text-primary flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-3xl">monetization_on</span>
                      {amountLabel}
                    </div>
                    <p className="font-body-sm text-body-sm text-outline mt-2">
                      {helperText}
                    </p>
                    {claimRecord && (
                      <p className="font-body-sm text-body-sm text-outline mt-1">
                        Beneficiary: {claimRecord.beneficiaryName} ({claimRecord.email})
                      </p>
                    )}
                    {walletClaim && (
                      <p className="font-body-sm text-body-sm text-outline mt-1">
                        Allocation: {walletClaim.percentage}% of the inheritance pool.
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center border-t border-outline-variant/20 pt-4">
                    <span className="font-label-bold text-label-bold text-outline uppercase">
                      Network Context
                    </span>
                    <div className="flex items-center gap-2 text-on-surface font-medium">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      {claimRecord?.network ?? 'Unavailable'}
                    </div>
                  </div>
                </div>
              </div>

              {!isNotFound && claimRecord && (
                <div className="mb-8 rounded-xl border border-outline-variant/30 bg-surface-container-low p-6 text-left">
                  <p className="font-label-bold text-label-bold text-outline uppercase mb-4 text-center">
                    Connect Wallet
                  </p>
                  <div className="flex flex-col gap-4">
                    <p className="font-body-sm text-body-sm text-outline text-center">
                      {!isConnected
                        ? 'Connect the beneficiary wallet first so the claim amount can be fetched from the contract.'
                        : address
                          ? `Connected wallet: ${address.slice(0, 6)}...${address.slice(-4)}`
                          : 'Wallet connected.'}
                    </p>
                    {!isConnected && (
                      <CustomConnectButton
                        title="Connect Wallet for Claim"
                        className="w-full py-5 font-headline-md text-headline-md"
                      />
                    )}
                  </div>
                </div>
              )}

              {!isNotFound && claimRecord && isConnected && (
                <div className="mb-8 rounded-xl border border-outline-variant/30 bg-surface-container-low p-6 text-left">
                  <p className="font-label-bold text-label-bold text-outline uppercase mb-4 text-center">
                    Email Verification
                  </p>
                  <div className="flex flex-col gap-4">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="w-full rounded-lg border border-primary bg-white px-4 py-3 font-semibold text-primary transition-colors hover:bg-primary/5"
                    >
                      {otpSent ? 'Resend OTP' : 'Send OTP to Email'}
                    </button>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otpInput}
                        onChange={(event) => setOtpInput(event.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-digit OTP"
                        disabled={!otpSent || otpVerified}
                        className="flex-1 rounded-lg border border-outline-variant/40 bg-white px-4 py-3 text-center outline-none transition focus:border-primary disabled:opacity-60"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={!otpSent || otpVerified || otpInput.length !== 6}
                        className="rounded-lg bg-primary px-5 py-3 font-semibold text-on-primary transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {otpVerified ? 'Verified' : 'Verify OTP'}
                      </button>
                    </div>
                    <p className="font-body-sm text-body-sm text-outline text-center">
                      Demo flow for now. After sending OTP, use the test code from the toast message.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {showClaimButton && (
                  <button
                    type="button"
                    onClick={handleClaimInheritance}
                    disabled={isClaiming || isClaimed}
                    className="w-full bg-primary text-on-primary py-5 rounded-lg font-headline-md text-headline-md shadow-lg hover:bg-primary-container transition-all active:opacity-80 active:scale-95 flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isClaimed ? 'Claim Submitted' : isClaiming ? 'Submitting Claim...' : 'Claim Inheritance'}
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                )}

                {!isNotFound && !showConnectWallet && !showClaimButton && (
                  <button
                    type="button"
                    disabled
                    className="w-full bg-primary text-on-primary py-5 rounded-lg font-headline-md text-headline-md shadow-lg opacity-60 flex items-center justify-center gap-3 cursor-not-allowed"
                  >
                    {isLoading
                      ? 'Checking Claim Link'
                      : !isConnected
                        ? 'Connect Wallet to Continue'
                        : isReadingClaim
                          ? 'Loading Claim Details...'
                          : isClaimed
                            ? 'Inheritance Already Claimed'
                            : !otpVerified
                              ? 'Verify Email to Continue'
                              : 'Claim Unavailable'}
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                )}

                <p className="font-body-sm text-body-sm text-outline flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  Secured by smart contract execution. All actions are final.
                </p>
              </div>
            </div>

            <div className="px-8 py-4 bg-surface-container-highest/50 border-t border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline text-lg">history</span>
                <span className="font-label-bold text-label-bold text-outline uppercase">
                  Event Triggered: {claimRecord?.triggeredAt ?? 'Unavailable'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline text-lg">account_tree</span>
                <span className="font-label-bold text-label-bold text-outline uppercase">
                  ID: {claimRecord?.claimId ?? 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {isNotFound && (
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-center text-outline shadow-sm">
              Demo emails: {MOCK_CLAIMS.map((claim) => claim.email).join(' | ')}
              {resolvedEmail && <p className="mt-2 text-sm">Checked link: {resolvedEmail}</p>}
            </div>
          )}
                                                                                                                                                      </div>
      </main>
    </div>
  );
};

export default ClaimInheritance;
