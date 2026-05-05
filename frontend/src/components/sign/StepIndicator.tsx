import { CheckCircle2 } from "lucide-react";

type PageStep = "verify-email" | "otp" | "attest" | "success";

const steps: { key: PageStep; label: string }[] = [
  { key: "verify-email", label: "Verify Email" },
  { key: "otp", label: "Enter OTP" },
  { key: "attest", label: "Attest" },
];

const indexMap: Record<PageStep, number> = {
  "verify-email": 0,
  otp: 1,
  attest: 2,
  success: 3,
};

const StepIndicator = ({ current }: { current: PageStep }) => {
  const currentIndex = indexMap[current];

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                i < currentIndex
                  ? "bg-primary text-white"
                  : i === currentIndex
                  ? "border-2 border-primary bg-primary/10 text-primary"
                  : "border-2 border-slate-200 bg-white text-slate-400"
              }`}
            >
              {i < currentIndex ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs font-medium ${
                i <= currentIndex ? "text-primary" : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`mb-4 h-px w-10 ${
                i < currentIndex ? "bg-primary" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;