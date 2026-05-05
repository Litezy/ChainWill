import { Users } from "lucide-react";

type Props = {
  count: number;
  required: number;
};

const AttestationCounter = ({ count, required }: Props) => {
  const unsigned = required - count;
  const percentage = required > 0 ? (count / required) * 100 : 0;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase text-slate-400">
          Attestation Progress
        </p>
        <Users className="h-5 w-5 text-primary" />
      </div>

      <div className="mt-4 flex items-end gap-2">
        <span className="text-4xl font-bold text-slate-950">{count}</span>
        <span className="mb-1 text-lg text-slate-400">/ {required}</span>
        <span className="mb-1 text-sm text-slate-500">signers attested</span>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-emerald-50 p-3 text-center">
          <p className="text-xl font-bold text-emerald-600">{count}</p>
          <p className="text-xs text-emerald-600">Signed</p>
        </div>
        <div className="rounded-3xl bg-amber-50 p-3 text-center">
          <p className="text-xl font-bold text-amber-600">{unsigned}</p>
          <p className="text-xs text-amber-600">Pending</p>
        </div>
      </div>
    </div>
  );
};

export default AttestationCounter;