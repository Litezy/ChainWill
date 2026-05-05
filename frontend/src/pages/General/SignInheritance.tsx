import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"; // ← fix: query param not route param
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { useContractStore } from "@/stores/contractStore";
import { useCallReadMethods } from "@/hooks/contract/useCallReadMethods";
import { useCallWriteMethods } from "@/hooks/contract/useCallWriteMethods";
import { useGasEstimator } from "@/hooks/contract/useGasEstimator";
import {
  dismissToast,
  loadingMessage,
  successMessage,
} from "@/utils/messageStatus";
import StepIndicator from "@/components/sign/StepIndicator";
import StepVerifyEmail from "@/components/sign/StepVerifyEmail";
import StepOtp from "@/components/sign/StepOtp";
import StepAttest from "@/components/sign/StepAttest";
import StepSuccess from "@/components/sign/StepSuccess";

type PageStep = "verify-email" | "otp" | "attest" | "success";

type AttestationStatus = {
  available: boolean;
  count: bigint;
  required: bigint;
};

const SIMULATED_OTP = "847291";

const SignInheritance = () => {
  // ── fix: read from query param not route param ──────────────────────
  const [searchParams] = useSearchParams();
  const signerEmail = searchParams.get("signerEmail") ?? "";

  const contractAddress = useContractStore((s) => s.contractAddress);

  const { callReadFunction } = useCallReadMethods("child", contractAddress ?? undefined);
  const { callWriteFunction } = useCallWriteMethods("child", contractAddress ?? undefined);
  const { estimateGas } = useGasEstimator("child", contractAddress ?? undefined);

  const [step, setStep] = useState<PageStep>("verify-email");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isAttesting, setIsAttesting] = useState(false);
  const [attestation, setAttestation] = useState<AttestationStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const fetchAttestationStatus = async () => {
    if (!contractAddress) return;
    setIsLoadingStatus(true);
    try {
      const result = await callReadFunction("getAttestationStatus", []);
      if (!result) return;
      const [available, count, required] = result as [boolean, bigint, bigint];
      setAttestation({ available, count, required });
    } catch (err) {
      console.error("Failed to fetch attestation status:", err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (step === "attest") fetchAttestationStatus();
  }, [step, contractAddress]);

  const handleSendOtp = () => {
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setStep("otp");
    }, 1200);
  };

  const handleVerifyOtp = () => {
    if (otpInput.trim() !== SIMULATED_OTP) {
      setOtpError("Incorrect OTP. Please try again.");
      return;
    }
    setOtpError("");
    setStep("attest");
  };

  const handleResendOtp = () => {
    setOtpInput("");
    setOtpError("");
    setStep("verify-email");
  };

  const handleAttest = async () => {
    const toastId = loadingMessage("Estimating gas...");
    setIsAttesting(true);
    try {
      const gas = await estimateGas("triggerBySigners", []);
      if (!gas) return;

      loadingMessage("Submitting attestation...");
      const { success } = await callWriteFunction("triggerBySigners", [], gas);
      if (!success) return;

      successMessage("Attestation submitted successfully");
      await fetchAttestationStatus();
      setStep("success");
    } finally {
      dismissToast(toastId);
      setIsAttesting(false);
    }
  };

  if (!contractAddress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="mt-6 text-xl font-semibold text-slate-950">No Will Found</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            The will contract could not be located. Please ensure you have the
            correct link from the will owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-950">
            Sign Inheritance
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            You've been designated as a signer for a ChainWill testament.
            Verify your identity to attest.
          </p>
          {/* show email in header once we have it */}
          {signerEmail && (
            <p className="mt-1 text-xs text-primary font-medium">{signerEmail}</p>
          )}
        </div>

        {step !== "success" && <StepIndicator current={step} />}

        {step === "verify-email" && (
          <StepVerifyEmail
            signerEmail={signerEmail}
            isSendingOtp={isSendingOtp}
            onSend={handleSendOtp}
          />
        )}

        {step === "otp" && (
          <StepOtp
            signerEmail={signerEmail}
            otpInput={otpInput}
            otpError={otpError}
            onOtpChange={setOtpInput}
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
          />
        )}

        {step === "attest" && (
          <StepAttest
            attestation={attestation}
            isLoadingStatus={isLoadingStatus}
            isAttesting={isAttesting}
            onAttest={handleAttest}
          />
        )}

        {step === "success" && <StepSuccess attestation={attestation} />}

        <p className="text-center text-xs text-slate-400">
          Secured by ChainWill Protocol · On-chain attestation
        </p>
      </div>
    </div>
  );
};

export default SignInheritance;