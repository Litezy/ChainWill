import { useTokenApprovalStore } from "@/stores/tokenApprovalStore";

export default function FundingTransactionsCard() {
  const transactions = useTokenApprovalStore((state) => state.history);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">Recent funding transactions</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">Transaction history</p>
        </div>
        <button className="text-sm font-semibold text-primary transition hover:text-primary/80">
          Download report
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 font-semibold text-slate-950">{transaction.event}</td>
                  <td className="px-4 py-4">{transaction.asset}</td>
                  <td className="px-4 py-4 text-slate-950">{Number(transaction.amount).toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        transaction.status === 'success'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {transaction.status === 'success' ? 'Success' : 'Revoked'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-500">{transaction.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No CWT approval transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
