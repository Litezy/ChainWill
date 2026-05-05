import { CheckCircle2 } from "lucide-react";
import FormInput from "@/components/FormInput";

type TokenOption = {
  symbol: string;
  label: string;
};

type Props = {
  selectedToken: TokenOption;
  onSelectToken: (token: TokenOption) => void;
  tokenOptions: TokenOption[];
  displayBalance: string;
  ownerName: string;
  ownerEmail: string;
  onOwnerNameChange: (value: string) => void;
  onOwnerEmailChange: (value: string) => void;
  validationError: string;
};

const StepOne = ({
  selectedToken,
  onSelectToken,
  tokenOptions,
  displayBalance,
  ownerName,
  ownerEmail,
  onOwnerNameChange,
  onOwnerEmailChange,
  validationError,
}: Props) => {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {tokenOptions.map((token) => (
          <button
            key={token.symbol}
            type="button"
            onClick={() => onSelectToken(token)}
            className={`rounded-[28px] border px-4 py-3 text-left transition ${
              selectedToken.symbol === token.symbol
                ? "border-primary bg-primary/10"
                : "border-slate-200 bg-white hover:border-primary/70"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{token.label}</p>
                <p className="mt-2 text-sm text-slate-500">{displayBalance}</p>
              </div>
              {selectedToken.symbol === token.symbol && (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
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
          onChange={(e) => onOwnerNameChange(e.target.value)}
        />
        <FormInput
          label="Your Email"
          id="owner-email"
          type="email"
          value={ownerEmail}
          placeholder="email@example.com"
          onChange={(e) => onOwnerEmailChange(e.target.value)}
        />
        {validationError && (
          <div className="rounded-3xl bg-rose-50 p-4 text-sm text-rose-700">
            {validationError}
          </div>
        )}
      </div>
    </>
  );
};

export default StepOne;