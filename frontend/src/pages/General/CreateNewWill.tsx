import { useMemo, useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { useAccount } from "wagmi";
import { useWillStatusStore } from "@/stores/willStatusStore";
import { formatUnits } from "ethers";
import { formatCompact } from "@/utils/pageHelpers";
import { useCreateWill } from "@/hooks/factory/useCreateWill";
import StepOne from "@/components/will/StepOne";
import StepTwo from "@/components/will/StepTwo";
import StepThree from "@/components/will/StepThree";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/Loader";

type Signer = {
  name: string;
  address: string;
  email: string;
};

type TokenOption = {
  symbol: string;
  label: string;
};

type CreateNewWillProps = {
  onClose?: () => void;
};
const tokenOptions: TokenOption[] = [
  { symbol: "CWT", label: "ChainWill Token (CWT)" },
];

const CreateNewWill: React.FC<CreateNewWillProps> = ({ onClose }) => {
  const walletBalance = useWillStatusStore((state) => state.ownerWalletBalance);
  const displayBalance = formatCompact(formatUnits(walletBalance, 18));
  const { createWill, isSubmitting } = useCreateWill();
  const { address: ownerWalletAddress } = useAccount();

  const [step, setStep] = useState(1);
  const [validationError, setValidationError] = useState("");

  // Step 1 state
  const [selectedToken, setSelectedToken] = useState<TokenOption>(
    tokenOptions[0],
  );
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  // Step 2 state
  const [signers, setSigners] = useState<Signer[]>([]);
  const [signerName, setSignerName] = useState("");
  const [signerAddress, setSignerAddress] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const navig = useNavigate();

  const stepLabel = useMemo(() => {
    if (step === 1) return "Select legacy token";
    if (step === 2) return "Add signers";
    return "Review details";
  }, [step]);

  const isAddressUnique = (address: string, excludeIndex?: number) =>
    !signers.some((s, i) => i !== excludeIndex && s.address === address);

  const isEmailUnique = (email: string, excludeIndex?: number) =>
    !signers.some((s, i) => i !== excludeIndex && s.email === email);

  const handleAddSigner = () => {
    const trimmedName = signerName.trim();
    const trimmedAddress = signerAddress.trim();
    const trimmedEmail = signerEmail.trim();

    if (!trimmedName || !trimmedAddress || !trimmedEmail) {
      setValidationError("All fields are required.");
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmedAddress)) {
      setValidationError("Invalid wallet address format.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setValidationError("Invalid email format.");
      return;
    }
    if (
      ownerWalletAddress &&
      trimmedAddress.toLowerCase() === ownerWalletAddress.toLowerCase()
    ) {
      setValidationError("Owner wallet cannot be added as a signer.");
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

  const handleNext = async () => {
    setValidationError("");

    if (step === 1) {
      if (!ownerName.trim() || !ownerEmail.trim()) {
        setValidationError("Owner name and email are required.");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(ownerEmail.trim())) {
        setValidationError("Invalid owner email format.");
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (signers.length < 2) {
        setValidationError("You need at least 2 signers to proceed.");
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      setLoading(true);
      // return console.log("Submitting will with data:", {
      //   ownerName,
      //   ownerEmail,
      //   signers,
      // });
      try {
        // signers are passed through as full signer inputs
        // (name, wallet address, email) to the factory contract.
        const success = await createWill({
          ownerName,
          ownerEmail,
          signers,
        });
        if (success) {
          navig("/auth/overview");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const canAddSigner =
    !!signerName.trim() &&
    !!signerAddress.trim() &&
    !!signerEmail.trim() &&
    signers.length < 3;
  const canProceedToStep3 = signers.length >= 2;

  return (
    <div className="max-w-2xl mx-auto p-8">
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
          {step === 1 && (
            <StepOne
              selectedToken={selectedToken}
              onSelectToken={setSelectedToken}
              tokenOptions={tokenOptions}
              displayBalance={displayBalance}
              ownerName={ownerName}
              ownerEmail={ownerEmail}
              onOwnerNameChange={setOwnerName}
              onOwnerEmailChange={setOwnerEmail}
              validationError={validationError}
            />
          )}
          {step === 2 && (
            <StepTwo
              signers={signers}
              signerName={signerName}
              signerAddress={signerAddress}
              signerEmail={signerEmail}
              editingIndex={editingIndex}
              validationError={validationError}
              canAddSigner={canAddSigner}
              onSignerNameChange={setSignerName}
              onSignerAddressChange={setSignerAddress}
              onSignerEmailChange={setSignerEmail}
              onAddSigner={handleAddSigner}
              onEditSigner={handleEditSigner}
              onRemoveSigner={handleRemoveSigner}
            />
          )}
          {step === 3 && (
            <StepThree
              selectedToken={selectedToken}
              ownerName={ownerName}
              ownerEmail={ownerEmail}
              signers={signers}
            />
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel drafting
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            {step > 1 && (
              <button
                type="button"
                onClick={() => {
                  setStep((current) => current - 1);
                  setValidationError("");
                }}
                disabled={isSubmitting}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={(step === 2 && !canProceedToStep3) || isSubmitting}
              className="rounded-full flex items-center bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Submitting..."
                : step < 3
                  ? `Continue to Step ${step + 1}`
                  : "Submit Will"}
              {!isSubmitting && <ChevronRight className="ml-2 h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <Loader
          isLoading={loading}
          variant="spinner"
          text="Creating will..."
          fullScreen={false}
        />
      )}
    </div>
  );
};

export default CreateNewWill;
