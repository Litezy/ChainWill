import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Wallet, ShieldCheck } from "lucide-react";
import CustomConnectButton from "@/components/CustomConnectButton";
import type { RawBeneficiary, WillStatus } from "@/types";
import { dismissToast, loadingMessage, successMessage, errorMessage } from "@/utils/messageStatus";

interface ClaimPanelProps {
  beneficiary: RawBeneficiary;
  willStatus: WillStatus | null;
  address: `0x${string}` | undefined;
  isConnected: boolean;
  isClaiming: boolean;
  formattedClaimAmount: string;
  onClaim: () => Promise<void>;
}

// ── OTP sub-component ─────────────────────────────────────────────────────────
// Plug your backend verification into `verifyOtp`. It should resolve true on
// success or throw/return false on failure.
interface OtpStepProps {
  beneficiaryEmail: string;
  onVerified: () => void;
}

const OtpStep = ({ beneficiaryEmail, onVerified }: OtpStepProps) => {
  const [otp, setOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // ── integrate your backend here ───────────────────────────────────
  const sendOtp = async () => {
    setIsSending(true);
    setOtpError(null);
    try {
      // TODO: replace with your API call, e.g.:
      // await api.post("/auth/otp/send", { email: beneficiaryEmail });
      await new Promise((r) => setTimeout(r, 800)); // placeholder
      setOtpSent(true);
    } catch {
      setOtpError("Failed to send OTP. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) return;
    setIsVerifying(true);
    setOtpError(null);
    try {
      // TODO: replace with your API call, e.g.:
      // const { verified } = await api.post("/auth/otp/verify", { email: beneficiaryEmail, otp });
      // if (!verified) throw new Error("Invalid OTP");
      await new Promise((r) => setTimeout(r, 800)); // placeholder — remove when wired
      onVerified();
    } catch {
      setOtpError("Invalid or expired OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">
            Verify your identity
          </p>
          <p className="text-xs text-slate-500">
            A one-time code will be sent to{" "}
            <span className="font-medium text-slate-700">{beneficiaryEmail}</span>
          </p>
        </div>
      </div>

      {!otpSent ? (
        <button
          type="button"
          onClick={() => void sendOtp()}
          disabled={isSending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Sending OTP...</>
          ) : (
            "Send OTP to Email"
          )}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Enter OTP
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ""));
                setOtpError(null);
              }}
              placeholder="6-digit code"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center font-mono text-lg tracking-widest text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
            {otpError && (
              <p className="text-xs text-rose-600">{otpError}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void sendOtp()}
              disabled={isSending}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {isSending ? "Resending..." : "Resend"}
            </button>
            <button
              type="button"
              onClick={() => void verifyOtp()}
              disabled={isVerifying || otp.length < 4}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifying ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
              ) : (
                "Verify & Continue"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── main ClaimPanel ───────────────────────────────────────────────────────────
type ClaimStep = "connect" | "otp" | "claim";

const ClaimPanel = ({
  beneficiary,
  willStatus,
  address,
  isConnected,
  isClaiming,
  formattedClaimAmount,
  onClaim,
}: ClaimPanelProps) => {
  const [claimStep, setClaimStep] = useState<ClaimStep>("connect");
  const [otpVerified, setOtpVerified] = useState(false);

  const walletMatchesBeneficiary =
    !!address &&
    address.toLowerCase() === beneficiary.wallet.toLowerCase();

  const canClaim =
    !!willStatus?.triggered &&
    isConnected &&
    walletMatchesBeneficiary &&
    !beneficiary.claimed &&
    otpVerified;

  // advance step when wallet connects
  const handleWalletConnected = () => {
    if (claimStep === "connect") setClaimStep("otp");
  };

  // if they just connected (not yet moved to otp step), advance
  if (isConnected && claimStep === "connect") {
    setClaimStep("otp");
  }

  const handleOtpVerified = () => {
    setOtpVerified(true);
    setClaimStep("claim");
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      {/* ── step indicator ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        {(["connect", "otp", "claim"] as ClaimStep[]).map((s, i) => {
          const stepIndex = ["connect", "otp", "claim"].indexOf(claimStep);
          const thisIndex = i;
          const isDone = thisIndex < stepIndex || (s === "otp" && otpVerified);
          const isActive = s === claimStep;
          return (
            <span key={s} className="flex items-center gap-2">
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </span>
              <span className={isActive ? "text-slate-700 font-semibold" : ""}>
                {s === "connect" ? "Connect" : s === "otp" ? "Verify" : "Claim"}
              </span>
              {i < 2 && <span className="flex-1 border-t border-dashed border-slate-200 w-4" />}
            </span>
          );
        })}
      </div>

      {/* ── step: connect ─────────────────────────────────────────── */}
      {!isConnected && (
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">
              Connect your wallet to begin
            </p>
            <p className="mt-1 text-xs text-slate-500">
              You must connect{" "}
              <span className="font-mono">
                {beneficiary.wallet.slice(0, 6)}...{beneficiary.wallet.slice(-4)}
              </span>{" "}
              — the wallet registered on-chain for this beneficiary.
            </p>
          </div>
          <CustomConnectButton
            title="Connect Wallet"
            className="w-full py-3"
          />
        </div>
      )}

      {/* ── connected wallet info (always shown when connected) ─────── */}
      {isConnected && (
        <div
          className={`flex items-center gap-3 rounded-3xl p-4 ${
            walletMatchesBeneficiary ? "bg-slate-50" : "bg-amber-50"
          }`}
        >
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              walletMatchesBeneficiary ? "bg-emerald-100" : "bg-amber-100"
            }`}
          >
            {walletMatchesBeneficiary ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Connected wallet</p>
            <p className="truncate font-mono text-xs text-slate-700">{address}</p>
          </div>
        </div>
      )}

      {/* ── wrong wallet warning ─────────────────────────────────────── */}
      {isConnected && !walletMatchesBeneficiary && (
        <div className="rounded-3xl bg-amber-50 p-4 text-sm text-amber-700">
          Wrong wallet connected. This claim requires{" "}
          <span className="font-mono font-semibold">
            {beneficiary.wallet.slice(0, 6)}...{beneficiary.wallet.slice(-4)}
          </span>
          . Switch wallets and reconnect.
        </div>
      )}

      {/* ── step: OTP — only show when wallet matches and otp not yet verified ── */}
      {isConnected && walletMatchesBeneficiary && claimStep === "otp" && !otpVerified && (
        <OtpStep
          beneficiaryEmail={beneficiary.email}
          onVerified={handleOtpVerified}
        />
      )}

      {/* ── will not triggered ───────────────────────────────────────── */}
      {isConnected && !willStatus?.triggered && (
        <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
          The will has not been executed yet. Admin must trigger and signers must
          complete attestation before claims open.
        </div>
      )}

      {/* ── already claimed ──────────────────────────────────────────── */}
      {beneficiary.claimed && (
        <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          You have already claimed {formattedClaimAmount} CWT from this will.
        </div>
      )}

      {/* ── claim button — shown at claim step ──────────────────────── */}
      {(claimStep === "claim" || beneficiary.claimed) && (
        <button
          type="button"
          onClick={() => void onClaim()}
          disabled={!canClaim || isClaiming}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isClaiming ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Claiming...</>
          ) : beneficiary.claimed ? (
            "Already Claimed"
          ) : (
            `Claim ${formattedClaimAmount} CWT`
          )}
        </button>
      )}
    </div>
  );
};

export default ClaimPanel;