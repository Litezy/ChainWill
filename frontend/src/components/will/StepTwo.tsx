import { Edit2, Trash2 } from "lucide-react";
import FormInput from "@/components/FormInput";

type Signer = {
  name: string;
  address: string;
  email: string;
};

type Props = {
  signers: Signer[];
  signerName: string;
  signerAddress: string;
  signerEmail: string;
  editingIndex: number | null;
  validationError: string;
  canAddSigner: boolean;
  onSignerNameChange: (value: string) => void;
  onSignerAddressChange: (value: string) => void;
  onSignerEmailChange: (value: string) => void;
  onAddSigner: () => void;
  onEditSigner: (index: number) => void;
  onRemoveSigner: (index: number) => void;
};

const StepTwo = ({
  signers,
  signerName,
  signerAddress,
  signerEmail,
  editingIndex,
  validationError,
  canAddSigner,
  onSignerNameChange,
  onSignerAddressChange,
  onSignerEmailChange,
  onAddSigner,
  onEditSigner,
  onRemoveSigner,
}: Props) => {
  return (
    <div className="space-y-3">
      {signers.length < 3 && (
        <div className="grid gap-4">
          <FormInput
            label="Signer name"
            id="signer-name"
            value={signerName}
            placeholder="e.g., Jane Doe"
            onChange={(e) => onSignerNameChange(e.target.value)}
          />
          <FormInput
            label="Wallet address"
            id="signer-address"
            value={signerAddress}
            placeholder="0x..."
            onChange={(e) => onSignerAddressChange(e.target.value)}
          />
          <FormInput
            label="Reminder email"
            id="signer-email"
            type="email"
            value={signerEmail}
            placeholder="email@example.com"
            onChange={(e) => onSignerEmailChange(e.target.value)}
          />
          {validationError && (
            <div className="rounded-3xl bg-rose-50 p-4 text-sm text-rose-700">
              {validationError}
            </div>
          )}
          <button
            type="button"
            onClick={onAddSigner}
            disabled={!canAddSigner}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingIndex !== null ? "Update signer" : "Add signer"} ({signers.length}/3)
          </button>
        </div>
      )}

      <div className="rounded-[28px] border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">
          Added signers ({signers.length})
        </p>
        <div className="mt-4 space-y-2">
          {signers.length === 0 ? (
            <p className="text-sm text-slate-500">No signers added yet.</p>
          ) : (
            signers.map((signer, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
              >
                <div>
                  <p><strong>Name:</strong> {signer.name}</p>
                  <p><strong>Address:</strong> {signer.address}</p>
                  <p><strong>Email:</strong> {signer.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEditSigner(index)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveSigner(index)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-rose-100 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StepTwo;