import { Mail, Loader2 } from "lucide-react";

type Props = {
  signerEmail: string;
  isSendingOtp: boolean;
  onSend: () => void;
};

const StepVerifyEmail = ({ signerEmail, isSendingOtp, onSend }: Props) => (
  <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Mail className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-950">Confirm your email</p>
        <p className="text-xs text-slate-500">
          We'll send a one-time code to verify your identity
        </p>
      </div>
    </div>

    <div className="mt-6 rounded-3xl bg-slate-50 px-4 py-3">
      <p className="text-xs text-slate-400">Signing as</p>
      <p className="mt-1 text-sm font-semibold text-slate-950 break-all">
        {signerEmail}
      </p>
    </div>

    <button
      onClick={onSend}
      disabled={isSendingOtp}
      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSendingOtp ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Sending OTP...
        </>
      ) : (
        <>
          <Mail className="h-4 w-4" />
          Send OTP to Email
        </>
      )}
    </button>
  </div>
);

export default StepVerifyEmail;