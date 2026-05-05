import { KeyRound } from "lucide-react";

const SIMULATED_OTP = "847291";

type Props = {
  signerEmail: string;
  otpInput: string;
  otpError: string;
  onOtpChange: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
};

const StepOtp = ({
  signerEmail,
  otpInput,
  otpError,
  onOtpChange,
  onVerify,
  onResend,
}: Props) => (
  <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <KeyRound className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-950">Enter your OTP</p>
        <p className="text-xs text-slate-500">
          Check your email for the verification code
        </p>
      </div>
    </div>

    {/* simulated OTP reveal */}
    <div className="mt-6 rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-4 text-center">
      <p className="text-xs font-semibold uppercase text-primary/60">
        Simulated OTP (dev only)
      </p>
      <p className="mt-1 text-3xl font-bold tracking-[0.3em] text-primary">
        {SIMULATED_OTP}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        In production this would be sent to {signerEmail}
      </p>
    </div>

    <div className="mt-6">
      <label className="text-xs font-semibold text-slate-500">
        Enter 6-digit code
      </label>
      <input
        type="text"
        maxLength={6}
        value={otpInput}
        onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, ""))}
        placeholder="000000"
        className="mt-2 w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-center text-lg font-bold tracking-widest text-slate-950 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {otpError && (
        <p className="mt-2 text-center text-xs text-rose-600">{otpError}</p>
      )}
    </div>

    <button
      onClick={onVerify}
      disabled={otpInput.length !== 6}
      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <KeyRound className="h-4 w-4" />
      Verify OTP
    </button>

    <button
      onClick={onResend}
      className="mt-3 w-full text-center text-xs text-slate-400 underline hover:text-slate-600"
    >
      Resend OTP
    </button>
  </div>
);

export default StepOtp;