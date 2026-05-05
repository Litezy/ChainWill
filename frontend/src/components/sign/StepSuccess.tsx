import { CheckCircle2 } from "lucide-react";
import AttestationCounter from "./AttestationCounter";

type AttestationStatus = {
  available: boolean;
  count: bigint;
  required: bigint;
};

type Props = {
  attestation: AttestationStatus | null;
};

const StepSuccess = ({ attestation }: Props) => {
  const count = attestation ? Number(attestation.count) : 0;
  const required = attestation ? Number(attestation.required) : 0;
  const allSigned = count >= required && required > 0;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
      </div>
      <h2 className="mt-6 text-xl font-bold text-slate-950">
        Attestation Submitted
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Your attestation has been recorded on-chain. Thank you for fulfilling
        your role as a designated signer.
      </p>

      {attestation && (
        <div className="mt-6">
          <AttestationCounter count={count} required={required} />
        </div>
      )}

      {allSigned ? (
        <div className="mt-4 rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">
          All required signers have attested. The inheritance can now be
          executed.
        </div>
      ) : (
        <div className="mt-4 rounded-3xl bg-primary/5 p-4 text-sm text-slate-600">
          Waiting for{" "}
          <span className="font-semibold text-primary">
            {required - count}
          </span>{" "}
          more signer(s) to attest before inheritance can proceed.
        </div>
      )}
    </div>
  );
};

export default StepSuccess;