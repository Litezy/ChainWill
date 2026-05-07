
import { useMemo, useState } from "react";
import { ShieldCheck, UserCircle2 } from "lucide-react";
import { InlineLoader } from "@/components/Loader";
import ModifySigners from "@/modals/ModifySigners";
import { useReadSigners } from "@/hooks/child/useReadSigners";
import type { SignerRecord } from "@/stores/signerStore";

const formatWallet = (wallet: string) =>
  wallet.length > 12 ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : wallet;

const Signers = () => {
  const [openSigner, setOpenSigner] = useState(false);
  const [selectedSigner, setSelectedSigner] = useState<SignerRecord | null>(null);
  const { signers, isLoading, isSubmitting, replaceSigner } = useReadSigners();

  const signedCount = useMemo(
    () => signers.filter((item) => item.signed).length,
    [signers]
  );
  const requiredThreshold = signers.length <= 1 ? signers.length : 2;
  const thresholdPercent = signers.length === 0 ? 0 : (requiredThreshold / signers.length) * 100;

  const openEditModal = (signer: SignerRecord) => {
    setSelectedSigner(signer);
    setOpenSigner(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">Signers & Guardians</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950">
            Dashboard guardian controls
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review current signers and replace them on-chain when a trusted verifier changes.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase text-slate-500">Protocol integrity</p>
              <p className="mt-3 text-base font-semibold text-slate-950">Multisig threshold</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-6 rounded-[28px] bg-slate-50 p-5">
            <p className="text-3xl font-semibold text-slate-950">
              {requiredThreshold} / {signers.length || 0}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Signed right now: {signedCount}. Threshold required for execution: {requiredThreshold}.
            </p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${thresholdPercent}%` }}
              />
            </div>
            <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Active signers
            </span>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-primary p-6 text-white shadow-sm shadow-primary/20">
          <p className="text-sm font-semibold uppercase text-primary/90">Email reminders</p>
          <h2 className="mt-3 text-xl font-semibold text-white">Keep your signers notified</h2>
          <p className="mt-4 text-sm leading-7 text-slate-100">
            Signer emails are read from contract storage and reused for off-chain notification flows.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-slate-100">
              Reminder policy
            </button>
            <button className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
              {isLoading ? "Loading signers..." : `${signers.length} configured`}
            </button>
          </div>
        </div>
      </div>

      <InlineLoader isLoading={isLoading} variant="spinner" size="sm" text="Loading signers…" />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {signers.map((guardian) => (
          <div
            key={`${guardian.id}-${guardian.wallet}`}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <UserCircle2 className="h-6 w-6" />
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  guardian.signed
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {guardian.signed ? "Signed" : "Ready"}
              </span>
            </div>
            <div className="mt-6 space-y-3">
              <p className="text-lg font-semibold text-slate-950">{guardian.name}</p>
              <div className="space-y-1 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-950">Wallet</span>: {formatWallet(guardian.wallet)}
                </p>
                <p>
                  <span className="font-semibold text-slate-950">Reminder email</span>: {guardian.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEditModal(guardian)}
                className="rounded-full bg-primary px-3 py-1.5 text-sm text-white"
              >
                Replace/Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && signers.length === 0 ? (
        <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm shadow-slate-200/50">
          No signers found for this will yet.
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <p className="text-sm font-semibold text-slate-700">Signer health & reminders</p>
        </div>
        <div className="overflow-x-auto px-6 py-6">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-4 py-3">Signer</th>
                <th className="px-4 py-3">Email reminder</th>
                <th className="px-4 py-3">Wallet</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {signers.map((guardian) => (
                <tr key={`${guardian.id}-row`} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-slate-950">{guardian.name}</td>
                  <td className="px-4 py-4 text-slate-500">{guardian.email}</td>
                  <td className="px-4 py-4 text-slate-500">{formatWallet(guardian.wallet)}</td>
                  <td className="px-4 py-4 text-emerald-700">
                    {guardian.signed ? "Attested" : "Active"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-sm text-slate-500">
          Replacing a signer calls `replaceSigner` on the will contract and then refreshes the persisted signer store.
        </div>
      </div>

      {openSigner && selectedSigner ? (
        <ModifySigners
          signer={selectedSigner}
          onClose={() => setOpenSigner(false)}
          onUpdateSigner={replaceSigner}
          isSubmitting={isSubmitting}
        />
      ) : null}
    </div>
  );
};

export default Signers;
