import { useMemo, useState } from "react";
import { Plus, UserPlus, ShieldCheck, FileText, Edit2, Trash2 } from "lucide-react";
import AddBeneficiary from "@/modals/AddBeneficiary";
import UpdateBeneficiary from "@/modals/UpdateBeneficiary";
import { useReadBeneficiary } from "@/hooks/child/useReadBeneficiary";
import type { BeneficiaryRecord } from "@/stores/beneficiaryStore";

const formatWallet = (wallet: string) =>
  wallet.length > 12 ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : wallet;

const Beneficiaries = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<BeneficiaryRecord | null>(null);

  const {
    beneficiaries,
    remainingPercentBps,
    remainingPercent,
    allocatedPercent,
    isLoading,
    isSubmitting,
    addBeneficiary,
    updateBeneficiary,
    removeBeneficiary,
  } = useReadBeneficiary();

  const allocationWidth = `${Math.min(allocatedPercent, 100)}%`;

  const verifiedInitials = useMemo(
    () =>
      beneficiaries.slice(0, 3).map((item) =>
        item.name
          .split(" ")
          .map((part) => part[0] ?? "")
          .join("")
          .slice(0, 2)
          .toUpperCase()
      ),
    [beneficiaries]
  );

  const handleEdit = (beneficiary: BeneficiaryRecord) => {
    setSelectedBeneficiary(beneficiary);
    setOpenUpdate(true);
  };

  const handleRemove = async (beneficiary: BeneficiaryRecord) => {
    const confirmed = window.confirm(
      `Remove ${beneficiary.name || "this beneficiary"} from the will?`
    );
    if (!confirmed) return;

    await removeBeneficiary(beneficiary.id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">Beneficiaries</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950">
            Registered beneficiary controls
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setOpenAdd(true)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add beneficiary
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.75fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-slate-500">Total allocation</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {allocatedPercent}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-500">Unallocated remaining</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {remainingPercent}%
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-slate-100 p-4">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>0%</span>
              <span>100%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-primary" style={{ width: allocationWidth }} />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Remaining: {remainingPercentBps} basis points.
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <p className="text-sm font-semibold uppercase text-slate-500">Beneficiary count</p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-3xl font-semibold text-slate-950">{beneficiaries.length}</p>
              <p className="text-sm text-slate-500">Registered on-chain recipients</p>
            </div>
            <div className="flex -space-x-2">
              {verifiedInitials.map((initials) => (
                <span
                  key={initials}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700"
                >
                  {initials}
                </span>
              ))}
              {beneficiaries.length > 3 ? (
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                  +{beneficiaries.length - 3}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">Registered beneficiaries</p>
            <p className="text-sm text-slate-500">
              Manage individuals who will receive assets upon testament execution.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpenAdd(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4" />
            Add beneficiary
          </button>
        </div>

        <div className="overflow-x-auto px-6 py-6">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Wallet address</th>
                <th className="px-4 py-3">Share (%)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {beneficiaries.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-950">{item.name}</div>
                    <div className="text-sm text-slate-500">{item.role}</div>
                    <div className="text-xs text-slate-400">{item.email}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-500">{formatWallet(item.wallet)}</td>
                  <td className="px-4 py-4 font-semibold text-slate-950">
                    {item.percentBps / 100}%
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        item.claimed
                          ? "bg-slate-200 text-slate-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.claimed ? "Claimed" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 transition hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 transition hover:bg-rose-100 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isLoading && beneficiaries.length === 0 ? (
            <p className="px-4 py-8 text-sm text-slate-500">
              No beneficiaries found yet. Add one to start allocating your will.
            </p>
          ) : null}
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-500">
          Beneficiary percentages are validated against the contract&apos;s 10,000 basis point maximum.
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-primary p-6 text-white shadow-sm shadow-primary/20">
          <div className="flex items-center gap-3 text-white">
            <ShieldCheck className="h-5 w-5" />
            <p className="text-sm font-semibold">Smart Verification</p>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-100">
            Beneficiary records are now read directly from the deployed will contract and kept in sync with local dashboard state.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-3 text-slate-950">
            <FileText className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold text-slate-950">Allocation Safety</p>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            All beneficiary percentages are converted to basis points before submission so the total never exceeds 100%.
          </p>
        </div>
      </div>

      {openAdd ? (
        <AddBeneficiary
          onClose={() => setOpenAdd(false)}
          onAdd={addBeneficiary}
          remainingPercentBps={remainingPercentBps}
          isSubmitting={isSubmitting}
        />
      ) : null}

      {openUpdate && selectedBeneficiary ? (
        <UpdateBeneficiary
          beneficiary={selectedBeneficiary}
          remainingPercentBps={remainingPercentBps}
          isSubmitting={isSubmitting}
          onClose={() => setOpenUpdate(false)}
          onUpdate={updateBeneficiary}
        />
      ) : null}
    </div>
  );
};

export default Beneficiaries;
