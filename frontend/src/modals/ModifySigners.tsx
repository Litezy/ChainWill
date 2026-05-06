import { useState } from "react";
import { X } from "lucide-react";
import ModalLayout from "@/layouts/ModalLayout";
import FormInput from "@/components/FormInput";
import type { SignerRecord } from "@/stores/signerStore";

type UpdateSignerPayload = {
  oldSigner: string;
  newSigner: string;
  name: string;
  email: string;
};

type ModifySignersProps = {
  signer: SignerRecord;
  onClose: () => void;
  onUpdateSigner: (payload: UpdateSignerPayload) => Promise<boolean>;
  isSubmitting: boolean;
};

const ModifySigners = ({
  signer,
  onClose,
  onUpdateSigner,
  isSubmitting,
}: ModifySignersProps) => {
  const [name, setName] = useState(signer.name);
  const [address, setAddress] = useState(signer.wallet);
  const [email, setEmail] = useState(signer.email);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedAddress || !trimmedEmail) {
      setError("All fields are required.");
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmedAddress)) {
      setError("Invalid wallet address.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError("Invalid email address.");
      return;
    }

    setError("");
    const success = await onUpdateSigner({
      oldSigner: signer.wallet,
      newSigner: trimmedAddress,
      name: trimmedName,
      email: trimmedEmail,
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
              Modify trusted signer
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Replace or edit {signer.name}
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
            label="Signer name"
            id="signer-name"
            value={name}
            placeholder="e.g., Jane Doe"
            onChange={(event) => setName(event.target.value)}
          />

          <FormInput
            label="Wallet address"
            id="signer-wallet"
            value={address}
            placeholder="0x..."
            onChange={(event) => setAddress(event.target.value)}
          />

          <FormInput
            label="Reminder email"
            id="signer-email"
            type="email"
            value={email}
            placeholder="email@example.com"
            onChange={(event) => setEmail(event.target.value)}
            helperText="This email will be used to notify the signer when the owner is unavailable."
          />

          <div className="rounded-3xl bg-amber-50 p-4 text-sm text-amber-700">
            Replacing a signer updates the on-chain signer wallet, name, and email in one transaction.
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
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </ModalLayout>
  );
};

export default ModifySigners;
