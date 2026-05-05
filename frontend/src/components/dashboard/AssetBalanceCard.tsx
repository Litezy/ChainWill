import {  WalletCards} from "lucide-react";
import { useWillStatusStore } from "@/stores/willStatusStore";
import { formatCwtAmount } from "@/utils/willStatus";

type AssetBalanceCardProps = {
  isLoading?: boolean;
};

export default function AssetBalanceCard({ isLoading = false }: AssetBalanceCardProps) {
  const walletBalance = useWillStatusStore((state) => state.ownerWalletBalance);
  const approvedBalance = useWillStatusStore((state) => state.approvedAmount);

  const displayWalletBalance = isLoading ? "Loading..." : formatCwtAmount(walletBalance);
  const displayApprovedBalance = isLoading ? "Loading..." : formatCwtAmount(approvedBalance);
  const totalWalletAmount = Number(walletBalance);
  const totalApprovedAmount = Number(approvedBalance);
  const liquidityCoverage =
    totalWalletAmount > 0
      ? Math.min((totalApprovedAmount / totalWalletAmount) * 100, 100)
      : 0;
  const liquidityCoverageLabel = `${liquidityCoverage.toFixed(1)}%`;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">Total wallet balance</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {displayWalletBalance} <span className="!text-sm font-medium text-slate-500">CWT</span>
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <WalletCards className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-slate-100 p-4">
        <div className="text-sm font-semibold text-slate-700">Wallet liquidity coverage</div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${liquidityCoverage}%` }}
          />
        </div>
        <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Approved: {displayApprovedBalance} CWT</span>
          <span>{liquidityCoverageLabel} of wallet approved</span>
          <span>Total Wallet: {displayWalletBalance} CWT</span>
        </div>
      </div>
    </div>
  );
}
