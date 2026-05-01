const allocationRows = [
  {
    beneficiary: 'Estate of Jane Doe',
    asset: 'USDC, ETH, WBTC',
    share: '45.00%',
    status: 'Approved',
    statusClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    beneficiary: 'Heritage Foundation',
    asset: 'LINK, UNI',
    share: '30.00%',
    status: 'Approved',
    statusClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    beneficiary: 'Private Signer Group',
    asset: 'All Remaining',
    share: '25.00%',
    status: 'Pending',
    statusClass: 'bg-amber-100 text-amber-700',
  },
];

export default function AllocationTable() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Digital Testament Allocation</h3>
          <p className="mt-1 text-sm text-slate-500">
            Track your asset distribution and approval status in a single view.
          </p>
        </div>
        <button className="rounded-full border border-slate-200 bg-slate-50 px-5 py-1.5  text-[10px] font-semibold text-slate-950 transition hover:bg-slate-100">
          Edit 
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full table-auto text-left text-sm text-slate-700">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-4 py-3">Beneficiary</th>
              <th className="px-4 py-3">Asset Class</th>
              <th className="px-4 py-3">Share</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {allocationRows.map((row) => (
              <tr key={row.beneficiary} className="hover:bg-slate-50">
                <td className="px-4 py-4 font-semibold text-slate-950">{row.beneficiary}</td>
                <td className="px-4 py-4 text-slate-500">{row.asset}</td>
                <td className="px-4 py-4 text-slate-950">{row.share}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${row.statusClass}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
