import { ShieldCheck, Clock, Loader2 } from "lucide-react";
import AttestationCounter from "./AttestationCounter";

type AttestationStatus = {
  available: boolean;
  count: bigint;
  required: bigint;
};

type Props = {
  attestation: AttestationStatus | null;
  isLoadingStatus: boolean;
  isAttesting: boolean;
  onAttest: () => void;
};

const StepAttest = ({
  attestation,
  isLoadingStatus,
  isAttesting,
  onAttest,
}: Props) => {
  const count = attestation ? Number(attestation.count) : 0;
  const required = attestation ? Number(attestation.required) : 0;

  // attest button only shown when count < 2 (0 or 1 signed)
  const showAttestButton = count < 2;
  // all signed — already executed
  const alreadyExecuted = count >= required && required > 0;

  return (
    <div className="space-y-4">
      {isLoadingStatus ? (
        <div className="flex items-center justify-center rounded-[28px] border border-slate-200 bg-white p-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : attestation ? (
        <AttestationCounter count={count} required={required} />
      ) : null}

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        {alreadyExecuted ? (
          // all signers done — no button needed
          <div className="rounded-3xl bg-emerald-50 p-5 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-emerald-600" />
            <p className="mt-3 text-sm font-semibold text-emerald-700">
              All signers have attested
            </p>
            <p className="mt-1 text-xs text-emerald-600">
              The inheritance has been fully authorized on-chain.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Ready to attest
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  By clicking attest, you confirm that the will owner is
                  inactive and authorize the inheritance to proceed on-chain.
                  This action is irreversible.
                </p>
              </div>
            </div>

            {attestation && !attestation.available && (
              <div className="mt-4 rounded-3xl bg-amber-50 p-4 text-sm text-amber-700">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" />
                  Attestation window is not open yet. The grace period may
                  still be active.
                </div>
              </div>
            )}

            {showAttestButton && (
              <button
                onClick={onAttest}
                disabled={isAttesting || !attestation?.available}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAttesting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Attest Inheritance
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StepAttest;