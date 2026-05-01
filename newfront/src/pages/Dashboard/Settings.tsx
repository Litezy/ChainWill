import CheckinButton from '@/components/ui/CheckinButton';
import { Bell, ShieldCheck, Lock, RefreshCcw } from 'lucide-react';

const Settings = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950">Account settings</h1>
        </div>

        <CheckinButton/>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase text-slate-500">Protocol timers</p>
              <p className="mt-3 text-base font-semibold text-slate-950">Inactivity and grace period</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>

          <div className="mt-6 space-y-6">
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Inactivity period</span>
                <span className="font-semibold text-slate-950">180 days</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[72%] rounded-full bg-primary" />
              </div>
              <p className="mt-3 text-sm text-slate-500">Wait time before protocol starts the proof-of-life process.</p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Grace period</span>
                <span className="font-semibold text-slate-950">30 days</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[30%] rounded-full bg-primary" />
              </div>
              <p className="mt-3 text-sm text-slate-500">Final window to cancel execution after inactivity detected.</p>
            </div>
          </div>

          <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90">
            <RefreshCcw className="h-4 w-4" />
            Update protocol
          </button>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase text-slate-500">Security notifications</p>
              <p className="mt-3 text-base font-semibold text-slate-950">Alert settings</p>
            </div>
            <Bell className="h-5 w-5 text-primary" />
          </div>

          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-950">Email alerts</p>
                <p className="text-sm text-slate-500">Confirmations & legacy updates.</p>
              </div>
              <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90">
                On
              </button>
            </div>

            <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-950">SMS verification</p>
                <p className="text-sm text-slate-500">Emergency protocol notifications.</p>
              </div>
              <button className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300">
                Off
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] bg-primary/5 p-5 text-sm text-slate-700">
            <p className="font-semibold text-slate-950">Recommended</p>
            <p className="mt-2">Enable SMS alerts for final grace period warnings.</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <div className="flex items-start gap-3 text-primary">
            <Lock className="h-5 w-5" />
            <div>
              <p className="text-sm font-semibold uppercase text-slate-500">Wallet recovery system</p>
              <p className="mt-2 text-base font-semibold text-slate-950">Protocol transfer process</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Initiating a wallet change requires a multi-step verification to ensure the security of your digital testament. This will begin a 7-day security cooldown.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            You must confirm the new address from both your current wallet and a verified secondary recovery device.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm shadow-slate-200/50">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Identity proof</p>
              <p className="mt-2 text-sm text-slate-500">Protects authorized changes to the recovery process.</p>
            </div>
            <div className="inline-flex rounded-3xl bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              Verified
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-700">
              Protocol sync is active
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-700">
              Secure recovery wallet linked
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
