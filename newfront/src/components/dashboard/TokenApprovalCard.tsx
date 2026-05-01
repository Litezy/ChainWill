export default function TokenApprovalCard() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">Token approval</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">Approve asset control</p>
        </div>
      </div>

      <form className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Token selection</label>
          <select className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
            <option>USDC (USD Coin)</option>
            <option>WETH (Wrapped Ether)</option>
            <option>DAI (Dai Stablecoin)</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Approval amount</label>
          <div className="relative">
            <input
              type="text"
              placeholder="0.00"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 pr-24 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">USDC</span>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">
          ChainWill Protocol Assurance: These tokens remain in your wallet and under your control until the smart contract trigger conditions are met.
        </div>

        <button className="w-full rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
          Approve
        </button>
      </form>
    </div>
  );
}
