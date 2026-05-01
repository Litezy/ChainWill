
import { useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, X, Edit2, Trash2 } from "lucide-react";
import ModalLayout from "@/layouts/ModalLayout";
import FormInput from "@/components/FormInput";

const tokenOptions = [
  { symbol: "CWT", label: "ChainWill Token(CWT)", balance: "4.25m" },
  { symbol: "USDC", label: "USD Coin (USDC)", balance: "12,420.00" },
];

const CreateNewWill = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [selectedToken, setSelectedToken] = useState(tokenOptions[0]);
  const [signerName, setSignerName] = useState("");
  const [signerAddress, setSignerAddress] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signers, setSigners] = useState<
    Array<{ name: string; address: string; email: string }>
  >([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [validationError, setValidationError] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  const stepLabel = useMemo(() => {
    if (step === 1) return "Select legacy token";
    if (step === 2) return "Add signers";
    return "Review details";
  }, [step]);

  const isAddressUnique = (address: string, excludeIndex?: number) => {
    return !signers.some((s, i) => i !== excludeIndex && s.address === address);
  };

  const isEmailUnique = (email: string, excludeIndex?: number) => {
    return !signers.some((s, i) => i !== excludeIndex && s.email === email);
  };

  const handleAddSigner = () => {
    const trimmedName = signerName.trim();
    const trimmedAddress = signerAddress.trim();
    const trimmedEmail = signerEmail.trim();

    if (!trimmedName || !trimmedAddress || !trimmedEmail) {
      setValidationError("All fields are required.");
      return;
    }
    if (!trimmedAddress || !/^0x[a-fA-F0-9]{40}$/.test(trimmedAddress)) {
      setValidationError("Invalid wallet address format.");
      return;
    }
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setValidationError("Invalid email format.");
      return;
    }

    if (!isAddressUnique(trimmedAddress, editingIndex ?? undefined)) {
      setValidationError("Wallet address must be unique.");
      return;
    }

    if (!isEmailUnique(trimmedEmail, editingIndex ?? undefined)) {
      setValidationError("Email must be unique.");
      return;
    }

    if (trimmedEmail === ownerEmail.trim()) {
      setValidationError(
        "Signer email cannot be the same as the owner's email.",
      );
      return;
    }

    if (editingIndex !== null) {
      setSigners((current) =>
        current.map((s, i) =>
          i === editingIndex
            ? {
                name: trimmedName,
                address: trimmedAddress,
                email: trimmedEmail,
              }
            : s,
        ),
      );
      setEditingIndex(null);
    } else {
      if (signers.length >= 3) return;
      setSigners((current) => [
        ...current,
        { name: trimmedName, address: trimmedAddress, email: trimmedEmail },
      ]);
    }

    setSignerName("");
    setSignerAddress("");
    setSignerEmail("");
    setValidationError("");
  };

  const handleEditSigner = (index: number) => {
    const signer = signers[index];
    setSignerName(signer.name);
    setSignerAddress(signer.address);
    setSignerEmail(signer.email);
    setEditingIndex(index);
    setValidationError("");
  };

  const handleRemoveSigner = (index: number) => {
    setSigners((current) => current.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setSignerName("");
      setSignerAddress("");
      setSignerEmail("");
    }
  };

  const canAddSigner =
    signerName.trim() &&
    signerAddress.trim() &&
    signerEmail.trim() &&
    signers.length < 3;
  const canProceedToStep3 = signers.length >= 2;

  return (
    <ModalLayout onClose={onClose} maxWidth="max-w-xl">
      <div className="rounded-t-2xl bg-white px-6 pb-6 pt-5 sm:rounded-2xl sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-slate-500">
              Draft New Will
            </p>
            <p className="mt-1 text-base font-semibold text-slate-950">
              Step {step} of 3
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className={`rounded-3xl border px-3 py-3 text-center text-sm ${
                step === index
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              <div className="font-semibold">Step {index}</div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <p className="text-sm font-semibold text-slate-900">{stepLabel}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {step === 1
              ? "Choose the legacy token for your digital testament."
              : step === 2
                ? "Add 2-3 signers with their name, wallet address, and reminder email for proof-of-life verification. You need at least 2 signers to proceed."
                : "Review the chosen token and signer list before submission."}
          </p>
        </div>

        <div className="mt-6 space-y-6">
          {step === 1 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {tokenOptions.map((token) => (
                  <button
                    key={token.symbol}
                    type="button"
                    onClick={() => setSelectedToken(token)}
                    className={`rounded-[28px] border p-5 text-left transition ${
                      selectedToken.symbol === token.symbol
                        ? "border-primary bg-primary/10"
                        : "border-slate-200 bg-white hover:border-primary/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {token.label}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Balance: {token.balance}
                        </p>
                      </div>
                      {selectedToken.symbol === token.symbol ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <FormInput
                  label="Your Full Name"
                  id="owner-name"
                  value={ownerName}
                  placeholder="e.g., John Doe"
                  onChange={(event) => setOwnerName(event.target.value)}
                />

                <FormInput
                  label="Your Email"
                  id="owner-email"
                  type="email"
                  value={ownerEmail}
                  placeholder="email@example.com"
                  onChange={(event) => setOwnerEmail(event.target.value)}
                />
              </div>
            </>
          ) : step === 2 ? (
            <div className="space-y-3">
              {signers.length < 3 && (
                <div className="grid gap-4">
                  <FormInput
                    label="Signer name"
                    id="signer-name"
                    value={signerName}
                    placeholder="e.g., Jane Doe"
                    onChange={(event) => setSignerName(event.target.value)}
                  />
                  <FormInput
                    label="Wallet address"
                    id="signer-address"
                    value={signerAddress}
                    placeholder="0x..."
                    onChange={(event) => setSignerAddress(event.target.value)}
                  />
                  <FormInput
                    label="Reminder email"
                    id="signer-email"
                    type="email"
                    value={signerEmail}
                    placeholder="email@example.com"
                    onChange={(event) => setSignerEmail(event.target.value)}
                  />
                  {validationError && (
                    <div className="rounded-3xl bg-rose-50 p-4 text-sm text-rose-700">
                      {validationError}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleAddSigner}
                    disabled={!canAddSigner}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingIndex !== null ? "Update signer" : "Add signer"} (
                    {signers.length}/3)
                  </button>
                </div>
              )}

              <div className="rounded-[28px] border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Added signers ({signers.length})
                </p>
                <div className="mt-4 space-y-2">
                  {signers.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No signers added yet.
                    </p>
                  ) : (
                    signers.map((signer, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                      >
                        <div>
                          <p>
                            <strong>Name:</strong> {signer.name}
                          </p>
                          <p>
                            <strong>Address:</strong> {signer.address}
                          </p>
                          <p>
                            <strong>Email:</strong> {signer.email}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditSigner(index)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSigner(index)}
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
          ) : (
            <div className="space-y-6">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">
                  Selected token
                </p>
                <p className="mt-3 text-base text-slate-950">
                  {selectedToken.label}
                </p>
                <p className="text-sm text-slate-500">
                  Balance: {selectedToken.balance}
                </p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">
                  Owner details
                </p>
                <p className="mt-3 text-base text-slate-950">{ownerName}</p>
                <p className="text-sm text-slate-500">{ownerEmail}</p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">
                  Signer summary ({signers.length})
                </p>
                <div className="mt-4 space-y-3">
                  {signers.map((signer, index) => (
                    <div
                      key={index}
                      className="rounded-3xl bg-white p-4 text-sm text-slate-700 shadow-sm"
                    >
                      <p>
                        <strong>Name:</strong> {signer.name}
                      </p>
                      <p>
                        <strong>Address:</strong> {signer.address}
                      </p>
                      <p>
                        <strong>Email:</strong> {signer.email}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel drafting
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((current) => current - 1)}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                if (step === 1) {
                  if (!ownerName.trim() || !ownerEmail.trim()) {
                    setValidationError("Owner name and email are required.");
                    return;
                  }
                }
                if (step === 2 && !canProceedToStep3) {
                  setValidationError("You need at least 2 signers to proceed.");
                  return;
                }
                if (step < 3) {
                  setStep((current) => current + 1);
                  setValidationError("");
                  return;
                }
                onClose();
              }}
              disabled={step === 2 && !canProceedToStep3}
              className="rounded-full flex items-center bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step < 3 ? "Continue to Step " + (step + 1) : "Submit Will"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </ModalLayout>
  );
};

export default CreateNewWill;
