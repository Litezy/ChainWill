import { PieChart } from 'lucide-react';

const distribution = [
  { label: 'ERC20 Token', value: '100%', color: 'bg-slate-900' },
//   { label: 'L1 Tokens', value: '25%', color: 'bg-slate-500' },
//   { label: 'NFTs', value: '10%', color: 'bg-slate-300' },
];

export default function AssetDistributionCard() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase  text-slate-400">
            Asset Distribution
          </p>
          <h3 className="mt-4 text-xl font-semibold text-slate-950">Portfolio balance</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-700">
          <PieChart className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-6 md:flex-row md:items-start">
        <div className="relative flex h-24 w-24 relative bg-primary items-center justify-center rounded-full bg-swhite">
         <div className="absolute w-20 h-20 bg-white rounded-full flex items-center justify-center ">
            <p className="text-sm font-semibold text-primary">{distribution.length} Asset{distribution.length > 1 ? "s" : ""}</p>
         </div>
        </div>

        <div className="grid gap-3">
          {distribution.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className={`inline-flex h-3.5 w-3.5 rounded-full ${item.color}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                <p className="text-sm text-slate-500">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
