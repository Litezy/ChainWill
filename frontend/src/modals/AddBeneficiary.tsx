import { useMemo, useState } from "react";
import { X } from "lucide-react";
import ModalLayout from "@/layouts/ModalLayout";
import FormInput from "@/components/FormInput";

type AddBeneficiaryPayload = {
  name: string;
  email: string;
  role: string;
  wallet: string;
  percent: number;
};

type AddBeneficiaryProps = {
  onClose: () => void;
  onAdd: (payload: AddBeneficiaryPayload) => Promise<boolean>;
  remainingPercentBps: number;
  isSubmitting: boolean;
};

const AddBeneficiary = ({
  onClose,
  onAdd,
  remainingPercentBps,
  isSubmitting,
}: AddBeneficiaryProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [wallet, setWallet] = useState("");
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState("");

  const remainingPercent = useMemo(
    () => remainingPercentBps / 100,
    [remainingPercentBps]
  );

  const handleSubmit = async () => {
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
    if (percent * 100 > remainingPercentBps) {
      setError(`Allocation exceeds remaining ${remainingPercent}%.`);
      return;
    }

    setError("");
    const success = await onAdd({
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
    <ModalLayout onClose={onClose} maxWidth="max-w-xl">
      <div className="rounded-t-2xl bg-white px-6 pb-6 pt-5 sm:rounded-2xl sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-slate-500">
              Add beneficiary
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Assign distribution for your digital legacy
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
            label="Beneficiary name"
            id="beneficiary-name"
            value={name}
            placeholder="e.g., Sarah Smith"
            onChange={(event) => setName(event.target.value)}
          />

          <FormInput
            label="Email address"
            id="beneficiary-email"
            type="email"
            value={email}
            placeholder="beneficiary email"
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
            label="Wallet address"
            id="beneficiary-wallet"
            value={wallet}
            placeholder="0x..."
            onChange={(event) => setWallet(event.target.value)}
          />

          <div>
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="allocation"
                className="text-sm font-medium text-slate-700"
              >
                Allocation percentage
              </label>
              <span className="text-sm font-semibold text-slate-950">
                {percent}%
              </span>
            </div>
            <input
              id="allocation"
              type="range"
              min={0}
              max={Math.max(0, Math.floor(remainingPercent))}
              value={percent}
              onChange={(event) => setPercent(Number(event.target.value))}
              className="mt-3 w-full cursor-pointer accent-primary"
            />
          </div>

          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">
            Remaining allocation: {remainingPercent}% ({remainingPercentBps} basis points).
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add beneficiary"}
          </button>
        </div>
      </div>
    </ModalLayout>
  );
};

export default AddBeneficiary;
