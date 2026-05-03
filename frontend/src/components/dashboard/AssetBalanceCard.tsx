import {  WalletCards} from "lucide-react";


export default function AssetBalanceCard() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">Total wallet balance</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            169,200.00 <span className="text-base font-medium text-slate-500">USDC</span>
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <WalletCards className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-slate-100 p-4">
        <div className="text-sm font-semibold text-slate-700">Wallet liquidity coverage</div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-[84%] rounded-full bg-primary" />
        </div>
        <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Approved: 142.5k</span>
          <span>Total Wallet: 169.2k</span>
        </div>
      </div>
    </div>
  );
}
