const currentAssets = [
  { symbol: 'USDC', amount: '142,500.00', label: 'USDC' },
  { symbol: 'WETH', amount: '26,700.00', label: 'WETH' },
];

export default function CurrentAssetsCard() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">Current assets</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">Value breakdown</p>
        </div>
      </div>

      <div className="space-y-4">
        {currentAssets.map((asset) => (
          <div key={asset.symbol} className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                {asset.symbol.slice(0, 1)}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-950">{asset.symbol}</p>
                <p className="text-sm text-slate-500">{asset.label}</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-950">${asset.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
