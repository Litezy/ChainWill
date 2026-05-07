import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { useReadBeneficiary } from "@/hooks/child/useReadBeneficiary";
import { InlineLoader } from "@/components/Loader";

const formatWallet = (wallet: string) =>
  wallet.length > 10 ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : wallet;

export default function AllocationTable() {
  const { beneficiaries, isLoading } = useReadBeneficiary();

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-950">Beneficiary Allocations</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Live on-chain breakdown of registered will recipients.
            </p>
          </div>
        </div>
        <Link
          to="/auth/beneficiaries"
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Manage
        </Link>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <InlineLoader isLoading variant="spinner" size="sm" text="Fetching beneficiaries…" />
        ) : beneficiaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Users className="h-5 w-5 text-slate-400" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700">No beneficiaries yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Add recipients on the Beneficiaries page to see them here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-left text-sm text-slate-700">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-400">
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Wallet</th>
                  <th className="px-3 py-3">Share</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {beneficiaries.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-950">{b.name}</p>
                      <p className="text-xs text-slate-400">{b.role}</p>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-500">
                      {formatWallet(b.wallet)}
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-950">
                      {(b.percentBps / 100).toFixed(2)}%
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          b.claimed
                            ? "bg-slate-100 text-slate-500"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {b.claimed ? "Claimed" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isLoading && beneficiaries.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
          {beneficiaries.length} recipient{beneficiaries.length !== 1 ? "s" : ""} registered ·{" "}
          {beneficiaries.filter((b) => !b.claimed).length} active
        </div>
      )}
    </div>
  );
}
