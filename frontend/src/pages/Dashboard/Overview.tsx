import { useEffect, useState } from 'react';
import { ArrowUpRight, ShieldCheck, Clock3 } from 'lucide-react';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import AssetDistributionCard from '@/components/dashboard/AssetDistributionCard';
import AllocationTable from '@/components/dashboard/AllocationTable';
import MetricCard from '@/components/dashboard/MetricCard';
import CheckinButton from '@/components/ui/CheckinButton';
import { useWillStatus } from '@/hooks/child/useWillStatus';
import { useWillStatusStore } from '@/stores/willStatusStore';
import { formatCwtAmount, getPrimaryTriggerCountdown } from '@/utils/willStatus';

const Overview: React.FC = () => {
  useWillStatus();
  const [now, setNow] = useState(Date.now());
  const isLoading = useWillStatusStore((state) => state.isLoading);
  const effectivePullAmount = useWillStatusStore((state) => state.effectivePullAmount);
  const timeRemaining = useWillStatusStore((state) => state.timeRemaining);
  const attestationOpensAt = useWillStatusStore((state) => state.attestationOpensAt);
  const triggerUnlocksAt = useWillStatusStore((state) => state.triggerUnlocksAt);
  const triggered = useWillStatusStore((state) => state.triggered);
  const locked = useWillStatusStore((state) => state.locked);
  const lastUpdatedAt = useWillStatusStore((state) => state.lastUpdatedAt);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const triggerCountdown = getPrimaryTriggerCountdown({
    timeRemaining,
    attestationOpensAt,
    triggerUnlocksAt,
    triggered,
    lastUpdatedAt,
    nowMs: now,
  });

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
          value={isLoading ? "Loading..." : `${formatCwtAmount(effectivePullAmount)} CWT`}
          caption="Amount the will can effectively pull from the owner's wallet right now."
          icon={<ShieldCheck className="h-5 w-5" />}
        />

        <MetricCard
          title="Trigger Countdown"
          value={isLoading ? "Loading..." : triggerCountdown.label}
          caption={triggerCountdown.caption}
          accent={locked ? "Locked" : triggerCountdown.accent}
          icon={<Clock3 className="h-5 w-5" />}
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
