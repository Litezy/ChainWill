import { CheckCircle2, Clock3, UserCheck } from 'lucide-react';

const activityItems = [
  {
    title: 'Successive Check-in',
    description: 'Manual verification confirmed via hardware wallet.',
    time: '2 hours ago',
    icon: CheckCircle2,
    accent: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Signer Update',
    description: "New primary beneficiary added to contract '0x72...9E41'.",
    time: 'Yesterday',
    icon: UserCheck,
    accent: 'bg-slate-100 text-slate-700',
  },
  {
    title: 'Finality Delay Updated',
    description: 'Inheritance trigger increased from 90 to 180 days.',
    time: '3 days ago',
    icon: Clock3,
    accent: 'bg-slate-100 text-slate-700',
  },
];

export default function ActivityFeed() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">Recent Ledger Activity</h3>
          <p className="mt-1 text-sm text-slate-500">Latest protocol events and trust updates.</p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {activityItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-start gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <span className={`mt-1 flex h-8 w-8 items-center justify-center rounded-3xl ${item.accent}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-sm text-slate-950">{item.title}</p>
                  <span className="text-[10px]  text-slate-400">{item.time}</span>
                </div>
                <p className="mt-2 text-[11px] leading-6 text-slate-600">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
