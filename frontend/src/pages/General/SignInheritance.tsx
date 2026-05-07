import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getAddress } from "ethers";
import { useAccount, useDisconnect } from "wagmi";
import { ShieldCheck, AlertTriangle, Loader2, UserCircle2, KeyRound, LogOut } from "lucide-react";
import { InlineLoader } from "@/components/Loader";
import CustomConnectButton from "@/components/CustomConnectButton";
import { useCallReadMethods } from "@/hooks/contract/useCallReadMethods";
import { useCallWriteMethods } from "@/hooks/contract/useCallWriteMethods";
import { useGasEstimator } from "@/hooks/contract/useGasEstimator";
import {
  dismissToast,
  errorMessage,
  loadingMessage,
  successMessage,
} from "@/utils/messageStatus";
import {
  sendOtp as sendOtpService,
  verifyOtp as verifyOtpService,
  sendNotificationEmail,
} from "@/services/emailNotice.service";

const decodeContractAddress = (value: string | null): `0x${string}` | null => {
  if (!value) return null;

  try {
    return getAddress(decodeURIComponent(value).trim()) as `0x${string}`;
  } catch {
    return null;
  }
};

type RawSigner = {
  id: bigint;
  wallet: string;
  signed: boolean;
  signedAt: bigint;
  name: string;
  email: string;
};

type RawBeneficiary = {
  id: bigint;
  wallet: string;
  percent: bigint;
  claimed: boolean;
  claimedAt: bigint;
  name: string;
  email: string;
  role: string;
};

type OwnerProfile = {
  name: string;
  email: string;
  wallet: string;
};

type AttestationStatus = {
  available: boolean;
  count: bigint;
  required: bigint;
};

type WillStatus = {
  triggered: boolean;
  locked: boolean;
  finalPool: bigint;
};

const SignInheritance = () => {
  const { email: emailParam } = useParams();
  const [searchParams] = useSearchParams();
  const { address, isConnected } = useAccount();

  const signerEmail = useMemo(
    () =>
      (
        emailParam ??
        searchParams.get("signerEmail") ??
        searchParams.get("email") ??
        ""
      ).trim(),
    [emailParam, searchParams]
  );

  const childAddress =
    decodeContractAddress(searchParams.get("contract")) ??
    decodeContractAddress(searchParams.get("child")) ??
    decodeContractAddress(searchParams.get("will"));
  const resolvedChildAddress = childAddress ?? undefined;

  const { callReadFunction } = useCallReadMethods("child", resolvedChildAddress);
  const { callWriteFunction } = useCallWriteMethods("child", resolvedChildAddress);
  const { estimateGas } = useGasEstimator("child", resolvedChildAddress);

  const { disconnect } = useDisconnect();
  const [signer, setSigner] = useState<RawSigner | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);
  const [attestation, setAttestation] = useState<AttestationStatus | null>(null);
  const [willStatus, setWillStatus] = useState<WillStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedInSession, setHasSubmittedInSession] = useState(false);

  // OTP state
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    setOtpError(null);
    const result = await sendOtpService({ email: signerEmail, audience: "signer" });
    setIsSendingOtp(false);
    if (result !== undefined) {
      setOtpSent(true);
      successMessage("OTP sent to your email.");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setIsVerifyingOtp(true);
    setOtpError(null);
    const result = await verifyOtpService({ email: signerEmail, otp });
    setIsVerifyingOtp(false);
    if (result !== undefined) {
      setOtpVerified(true);
      successMessage("Identity verified.");
    } else {
      setOtpError("Invalid or expired OTP. Please try again.");
    }
  };

  const fetchPageData = useCallback(async () => {
    if (!signerEmail) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [signerResult, ownerResult, attestationResult, willStatusResult] =
        await Promise.all([
          callReadFunction<RawSigner>("getSignerByEmail", [signerEmail]),
          callReadFunction<[string, string, string]>("getOwnerProfile", []),
          callReadFunction<[boolean, bigint, bigint]>("getAttestationStatus", []),
          callReadFunction<any>("getWillStatus", []),
        ]);

      if (signerResult) setSigner(signerResult);
      if (ownerResult) {
        const [name, email, wallet] = ownerResult;
        setOwnerProfile({ name, email, wallet });
      }
      if (attestationResult) {
        const [available, count, required] = attestationResult;
        setAttestation({ available, count, required });
      }
      if (willStatusResult) {
        setWillStatus({
          triggered: willStatusResult.triggered,
          locked: willStatusResult.locked,
          finalPool: willStatusResult.finalPool,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [callReadFunction, signerEmail]);

  useEffect(() => {
    void fetchPageData();
  }, [fetchPageData]);

  const walletMatchesSigner =
    !!address &&
    !!signer &&
    address.toLowerCase() === signer.wallet.toLowerCase();

  const canAttest =
    !!signer &&
    !!attestation?.available &&
    walletMatchesSigner &&
    !willStatus?.triggered &&
    !hasSubmittedInSession &&
    otpVerified;

  const handleAttest = async () => {
    const toastId = loadingMessage("Estimating gas...");
    setIsSubmitting(true);

    try {
      const gas = await estimateGas("triggerBySigners", []);
      if (!gas) return;

      loadingMessage("Submitting attestation...");
      const { success } = await callWriteFunction("triggerBySigners", [], gas);
      if (!success) return;

      setHasSubmittedInSession(true);
      successMessage("Attestation submitted successfully.");
      await fetchPageData();

      // Check if the will is now triggered (threshold met) and notify beneficiaries
      const updatedStatus = await callReadFunction<{ triggered: boolean }>("getWillStatus", []);
      if (updatedStatus?.triggered) {
        const beneficiariesResult = await callReadFunction<RawBeneficiary[]>("getBeneficiaries", []);
        if (beneficiariesResult && beneficiariesResult.length > 0 && ownerProfile) {
          await sendNotificationEmail({
            type: "beneficiary",
            ownerName: ownerProfile.name,
            contractAddress: childAddress as string,
            beneficiaries: beneficiariesResult.map((b) => ({
              beneficiaryName: b.name,
              beneficiaryEmail: b.email,
              allocationPercentage: Number(b.percent) / 100,
            })),
          });
          successMessage("Beneficiaries have been notified via email.");
        }
      }
    } catch (err) {
      errorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  if (!signerEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-600" />
          <h1 className="mt-6 text-xl font-semibold text-slate-950">Missing signer email</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Open this page from the signer invitation link so the signer email can be looked up on-chain.
          </p>
        </div>
      </div>
    );
  }

  if (!childAddress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-600" />
          <h1 className="mt-6 text-xl font-semibold text-slate-950">Missing contract address</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Open this page with the will contract in the URL, for example
            <span className="mx-1 font-mono">?contract=0x...</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-950">Signer Attestation</h1>
            <p className="mt-2 text-sm text-slate-500">
              This page is for designated signers only. Admin must open attestation first, then signers execute the on-chain trigger.
            </p>
            <p className="mt-2 text-xs font-medium text-primary">{signerEmail}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-400">Owner Profile</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-950">Name:</span> {ownerProfile?.name ?? "Loading..."}</p>
              <p><span className="font-semibold text-slate-950">Email:</span> {ownerProfile?.email ?? "Loading..."}</p>
              <p className="break-all"><span className="font-semibold text-slate-950">Wallet:</span> {ownerProfile?.wallet ?? "Loading..."}</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-400">Signer Profile</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-950">Name:</span> {signer?.name ?? "Loading..."}</p>
              <p><span className="font-semibold text-slate-950">Email:</span> {signer?.email ?? signerEmail}</p>
              <p className="break-all"><span className="font-semibold text-slate-950">Registered Wallet:</span> {signer?.wallet ?? "Loading..."}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <UserCircle2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-950">Attestation Status</p>
              {isLoading ? (
                <div className="mt-4">
                  <InlineLoader isLoading variant="spinner" size="sm" text="Loading signer details…" />
                </div>
              ) : (
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-950">Attestation Open:</span>{" "}
                    {attestation?.available ? "Yes" : "No"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-950">Signer Count:</span>{" "}
                    {attestation ? `${Number(attestation.count)} / ${Number(attestation.required)}` : "Unavailable"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-950">Will Executed:</span>{" "}
                    {willStatus?.triggered ? "Yes" : "No"}
                  </p>
                  {isConnected ? (
                    <p className="break-all">
                      <span className="font-semibold text-slate-950">Connected Wallet:</span> {address}
                    </p>
                  ) : null}
                </div>
              )}

              {!isConnected ? (
                <div className="mt-6">
                  <CustomConnectButton title="Connect Signer Wallet" className="w-full py-4" />
                </div>
              ) : null}

              {isConnected && signer && !walletMatchesSigner ? (
                <div className="mt-6 rounded-3xl bg-amber-50 p-4 text-sm text-amber-700">
                  Connect the registered signer wallet to attest. The current contract only accepts the signer wallet stored on-chain.
                </div>
              ) : null}

              {/* OTP verification — shown when wallet matches and OTP not yet verified */}
              {isConnected && walletMatchesSigner && !otpVerified && !willStatus?.triggered && (
                <div className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <KeyRound className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Verify your identity</p>
                      <p className="text-xs text-slate-500">
                        A one-time code will be sent to{" "}
                        <span className="font-medium text-slate-700">{signerEmail}</span>
                      </p>
                    </div>
                  </div>

                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={() => void handleSendOtp()}
                      disabled={isSendingOtp}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSendingOtp ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Sending OTP...</>
                      ) : (
                        "Send OTP to Email"
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Enter OTP</label>
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
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-center font-mono text-lg tracking-widest text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                        />
                        {otpError && <p className="text-xs text-rose-600">{otpError}</p>}
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => void handleSendOtp()}
                          disabled={isSendingOtp}
                          className="rounded-full border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
                        >
                          {isSendingOtp ? "Resending..." : "Resend"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleVerifyOtp()}
                          disabled={isVerifyingOtp || otp.length < 6}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isVerifyingOtp ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
                          ) : (
                            "Verify & Continue"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isConnected && willStatus?.triggered ? (
                <div className="mt-6 rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">
                  Signer threshold has already been met. Beneficiary claim is now open.
                </div>
              ) : null}

              {hasSubmittedInSession && !willStatus?.triggered ? (
                <div className="mt-6 space-y-3">
                  <div className="rounded-3xl bg-primary/5 p-4 text-sm text-slate-600">
                    Your attestation was submitted in this session. Waiting for the remaining signer threshold to execute the will.
                  </div>
                  <button
                    type="button"
                    onClick={() => disconnect()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Disconnect Wallet
                  </button>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => void handleAttest()}
                disabled={!canAttest || isSubmitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Attest and Execute Trigger
                  </>
                )}
              </button>

              <p className="mt-4 text-xs text-slate-400">
                Attestation is only valid after admin opens the window. Once signer threshold is reached, the will executes and beneficiary claim becomes available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInheritance;
