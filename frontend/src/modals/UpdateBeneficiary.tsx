import { useState } from "react";
import { X } from "lucide-react";
import ModalLayout from "@/layouts/ModalLayout";
import FormInput from "@/components/FormInput";
import type { BeneficiaryRecord } from "@/stores/beneficiaryStore";

type UpdateBeneficiaryPayload = {
  id: number;
  name: string;
  email: string;
  role: string;
  wallet: string;
  percent: number;
};

type UpdateBeneficiaryProps = {
  beneficiary: BeneficiaryRecord;
  remainingPercentBps: number;
  isSubmitting: boolean;
  onClose: () => void;
  onUpdate: (payload: UpdateBeneficiaryPayload) => Promise<boolean>;
};

const UpdateBeneficiary = ({
  beneficiary,
  remainingPercentBps,
  isSubmitting,
  onClose,
  onUpdate,
}: UpdateBeneficiaryProps) => {
  const [name, setName] = useState(beneficiary.name);
  const [email, setEmail] = useState(beneficiary.email);
  const [role, setRole] = useState(beneficiary.role);
  const [wallet, setWallet] = useState(beneficiary.wallet);
  const [percent, setPercent] = useState(beneficiary.percentBps / 100);
  const [error, setError] = useState("");

  const maxAllowedPercent = (remainingPercentBps + beneficiary.percentBps) / 100;

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedRole = role.trim();
    const trimmedWallet = wallet.trim();

    if (!trimmedName || !trimmedEmail || !trimmedRole || !trimmedWallet) {
      setError("All fields are required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError("Invalid email address.");
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmedWallet)) {
      setError("Invalid wallet address.");
      return;
    }
    if (percent <= 0) {
      setError("Allocation must be greater than 0%.");
      return;
    }
    if (percent * 100 > remainingPercentBps + beneficiary.percentBps) {
      setError(`Allocation exceeds allowed ${maxAllowedPercent}%.`);
      return;
    }

    setError("");
    const success = await onUpdate({
      id: beneficiary.id,
      name: trimmedName,
      email: trimmedEmail,
      role: trimmedRole,
      wallet: trimmedWallet,
      percent,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <ModalLayout onClose={onClose} maxWidth="max-w-2xl">
      <div className="rounded-t-2xl bg-white px-6 pb-6 pt-5 sm:rounded-2xl sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-slate-500">
              Update beneficiary
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Modify beneficiary details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <FormInput
            label="Name"
            id="beneficiary-name"
            value={name}
            placeholder="e.g., John Doe"
            onChange={(event) => setName(event.target.value)}
          />

          <FormInput
            label="Email"
            id="beneficiary-email"
            type="email"
            value={email}
            placeholder="email@example.com"
            onChange={(event) => setEmail(event.target.value)}
          />

          <FormInput
            label="Role"
            id="beneficiary-role"
            value={role}
            placeholder="e.g., Daughter · Primary"
            onChange={(event) => setRole(event.target.value)}
          />

          <FormInput
            label="Wallet Address"
            id="beneficiary-address"
            value={wallet}
            placeholder="0x..."
            onChange={(event) => setWallet(event.target.value)}
          />

          <div>
            <label htmlFor="share" className="mb-2 block text-sm font-medium text-slate-700">
              Share Percentage
            </label>
            <input
              id="share"
              type="number"
              min={1}
              max={maxAllowedPercent}
              value={percent}
              onChange={(event) => setPercent(Number(event.target.value))}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-2 text-xs text-slate-500">
              Allowed up to {maxAllowedPercent}% including this beneficiary&apos;s current allocation.
            </p>
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update beneficiary"}
          </button>
        </div>
      </div>
    </ModalLayout>
  );
};

export default UpdateBeneficiary;
