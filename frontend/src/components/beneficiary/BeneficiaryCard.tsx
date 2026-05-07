import type { OwnerProfile, RawBeneficiary, WillStatus } from "@/types";


interface BeneficiaryCardProps {
  ownerProfile: OwnerProfile | null;
  beneficiary: RawBeneficiary;
  willStatus: WillStatus | null;
  tokenAddress: string;
  formattedClaimAmount: string;
  onAddTokenToWallet: () => void;
}

const BeneficiaryCard = ({
  ownerProfile,
  beneficiary,
  willStatus,
  tokenAddress,
  formattedClaimAmount,
  onAddTokenToWallet,
}: BeneficiaryCardProps) => {
  return (
    <>
      {/* profiles */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">Testator</p>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-950">Name:</span>{" "}
              {ownerProfile?.name ?? "—"}
            </p>
            <p>
              <span className="font-semibold text-slate-950">Email:</span>{" "}
              {ownerProfile?.email ?? "—"}
            </p>
            <p className="break-all">
              <span className="font-semibold text-slate-950">Wallet:</span>{" "}
              {ownerProfile?.wallet ?? "—"}
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Your Beneficiary Record
          </p>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-950">Name:</span>{" "}
              {beneficiary.name}
            </p>
            <p>
              <span className="font-semibold text-slate-950">Role:</span>{" "}
              {beneficiary.role}
            </p>
            <p>
              <span className="font-semibold text-slate-950">Allocation:</span>{" "}
              {Number(beneficiary.percent) / 100}%
            </p>
            <p className="break-all">
              <span className="font-semibold text-slate-950">Registered Wallet:</span>{" "}
              <span className="font-mono text-xs">{beneficiary.wallet}</span>
            </p>
          </div>
        </div>
      </div>

      {/* claim details + token */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">
              Claim Details
            </p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-950">Will Executed:</span>{" "}
                <span
                  className={
                    willStatus?.triggered
                      ? "text-emerald-600 font-semibold"
                      : "text-amber-600"
                  }
                >
                  {willStatus?.triggered ? "Yes" : "Not yet"}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-950">Claimed:</span>{" "}
                <span
                  className={
                    beneficiary.claimed
                      ? "text-emerald-600 font-semibold"
                      : "text-slate-500"
                  }
                >
                  {beneficiary.claimed ? "Yes" : "No"}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-950">Your Share:</span>{" "}
                <span className="text-primary font-semibold">
                  {formattedClaimAmount} CWT
                </span>
              </p>
              {beneficiary.claimedAt > 0n && (
                <p>
                  <span className="font-semibold text-slate-950">Claimed At:</span>{" "}
                  {new Date(Number(beneficiary.claimedAt) * 1000).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Token</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="break-all font-mono text-xs text-slate-500">
                {tokenAddress || "—"}
              </p>
              {tokenAddress && (
                <button
                  type="button"
                  onClick={onAddTokenToWallet}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Add CWT to Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BeneficiaryCard;