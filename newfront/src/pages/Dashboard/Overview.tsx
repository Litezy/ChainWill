import { ArrowUpRight, ShieldCheck, Clock3 } from 'lucide-react';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import AssetDistributionCard from '@/components/dashboard/AssetDistributionCard';
import AllocationTable from '@/components/dashboard/AllocationTable';
import MetricCard from '@/components/dashboard/MetricCard';
import CheckinButton from '@/components/ui/CheckinButton';

const Overview: React.FC = () => {
  return (
    <div className="mx-auto min-h-screen max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[32px]  ">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start flex-col ">
            <p className="text-2xl font-extrabold uppercase text-primary">
              Institutional On-Chain Assurance
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-950 ">
              Secure your digital legacy with automated smart contract finality.
            </p>
            {/* <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
              A modern control center for digital estates, with multi-layered verification,
              distributed asset allocation, and a compliance-ready ledger experience.
            </p> */}
          </div>

          <CheckinButton/>
        </div>
      </section>

      <div className="grid gap-3 xl:grid-cols-[1fr_1fr_0.94fr]">
        <MetricCard
          title="Effective Pull Amount"
          value="$1,240,500.00"
          caption="Calculated estate liquidity available for execution."
          accent="+4.2% since last month"
          icon={<ShieldCheck className="h-5 w-5" />}
        />

        <MetricCard
          title="Trigger Countdown"
          value="178 Days"
          caption="Next mandatory check-in before grace period begins."
          icon={<Clock3 className="h-5 w-5" />}
          footer={
            <div className="space-y-3">
              <div className="h-3 rounded-full bg-slate-100">
                <div className="h-3 w-[72%] rounded-full bg-indigo-950" />
              </div>
              <p className="text-sm text-slate-500">72% of the check-in window has elapsed.</p>
            </div>
          }
        />

        <AssetDistributionCard />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.5fr_0.85fr]">
        <AllocationTable />
        <ActivityFeed />
      </div>

      <section className="rounded-[32px] bg-indigo-950 px-6 py-8 text-white shadow-xl shadow-indigo-950/20 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="text-sm uppercase text-sky-200">Upgrade to Institutional Áustody</p>
            <h2 className="mt-3 text-base font-semibold text-white sm:text-xl">
              Enable multi-sig legal firm verification and automated inheritance tax provisioning.
            </h2>
          </div>

          <button className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-indigo-950 transition hover:bg-slate-100">
            <span>Inquire for Enterprise</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Overview;
