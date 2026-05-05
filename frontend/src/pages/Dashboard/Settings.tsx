import CheckinButton from '@/components/ui/CheckinButton';
import { Bell, ShieldCheck, Lock, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useWillStatus } from '@/hooks/child/useWillStatus';
import { useCallWriteMethods } from '@/hooks/contract/useCallWriteMethods';
import { useGasEstimator } from '@/hooks/contract/useGasEstimator';
import { useWillStatusStore } from '@/stores/willStatusStore';
import {
  dismissToast,
  errorMessage,
  loadingMessage,
  successMessage,
} from '@/utils/messageStatus';
import {
  formatCountdown,
  formatUnixDateTime,
  getLiveTimeRemaining,
  getSecondsUntil,
} from '@/utils/willStatus';

const Settings = () => {
  const { refetch } = useWillStatus();

  const { callWriteFunction } = useCallWriteMethods("child");
  const { estimateGas } = useGasEstimator("child");
  const triggerRefresh = useWillStatusStore((state) => state.triggerRefresh);
  const isLoading = useWillStatusStore((state) => state.isLoading);
  const timeRemaining = useWillStatusStore((state) => state.timeRemaining);
  const attestationOpensAt = useWillStatusStore((state) => state.attestationOpensAt);
  const triggerUnlocksAt = useWillStatusStore((state) => state.triggerUnlocksAt);
  const triggered = useWillStatusStore((state) => state.triggered);
  const locked = useWillStatusStore((state) => state.locked);
  const lastUpdatedAt = useWillStatusStore((state) => state.lastUpdatedAt);
  const [now, setNow] = useState(Date.now());
  const [gracePeriodDays, setGracePeriodDays] = useState("");
  const [isUpdatingGracePeriod, setIsUpdatingGracePeriod] = useState(false);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const nowInSeconds = Math.floor(now / 1000);

  const gracePeriodExpired = triggered && triggerUnlocksAt > 0 && nowInSeconds >= triggerUnlocksAt;
  const gracePeriodActive = triggered && triggerUnlocksAt > 0 && nowInSeconds < triggerUnlocksAt;

  const inactivityCountdown = triggered
    ? "0s"
    : formatCountdown(getLiveTimeRemaining(timeRemaining, lastUpdatedAt, now));
  const attestationCountdown = formatCountdown(getSecondsUntil(attestationOpensAt, now));
  const unlockCountdown = formatCountdown(getSecondsUntil(triggerUnlocksAt, now));
  const currentGracePeriod = !triggered
    ? "Not started"
    : gracePeriodExpired
    ? "Expired"
    : gracePeriodActive
    ? formatCountdown(triggerUnlocksAt - nowInSeconds)
    : "0s";

  const handleGracePeriodUpdate = async () => {
    const parsedDays = Number(gracePeriodDays);

    if (!Number.isFinite(parsedDays) || parsedDays <= 0) {
      errorMessage("Enter a valid grace period in days");
      return;
    }

    const gracePeriodInSeconds = BigInt(Math.floor(parsedDays * 86400));
    const toastId = loadingMessage("Updating grace period...");
    setIsUpdatingGracePeriod(true);

    try {
      const gas = await estimateGas("setGracePeriod", [gracePeriodInSeconds]);
      if (!gas) return;

      const {success} = await callWriteFunction("setGracePeriod", [gracePeriodInSeconds], gas);
      if (!success) return;

      triggerRefresh();
      setGracePeriodDays("");
      successMessage("Grace period updated");
    } finally {
      dismissToast(toastId);
      setIsUpdatingGracePeriod(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950">Account settings</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refetch}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
          <CheckinButton />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
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
                <span>Inactivity countdown</span>
                <span className="font-semibold text-slate-950">
                  {isLoading ? "Loading..." : inactivityCountdown}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-500">Time left before the proof-of-life process begins.</p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Attestation opens in</span>
                <span className="font-semibold text-slate-950">
                  {isLoading ? "Loading..." : attestationCountdown}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Scheduled for {formatUnixDateTime(attestationOpensAt)}.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Trigger unlocks in</span>
                <span className="font-semibold text-slate-950">
                  {isLoading ? "Loading..." : unlockCountdown}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Scheduled for {formatUnixDateTime(triggerUnlocksAt)}.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Current grace period</span>
                <div className="flex items-center gap-2">
                  {triggered && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        gracePeriodExpired
                          ? "bg-red-100 text-red-600"
                          : gracePeriodActive
                          ? "bg-amber-100 text-amber-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {gracePeriodExpired ? "Expired" : "Active"}
                    </span>
                  )}
                  <span className="font-semibold text-slate-950">
                    {isLoading ? "Loading..." : currentGracePeriod}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {gracePeriodExpired
                  ? "Grace period has ended. Trigger is now unlocked."
                  : gracePeriodActive
                  ? `Expires ${formatUnixDateTime(triggerUnlocksAt)}.`
                  : "Only the grace period is configurable here. Inactivity timing remains contract-controlled."}
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={gracePeriodDays}
                  onChange={(event) => setGracePeriodDays(event.target.value)}
                  placeholder="Grace period in days"
                  className="w-2/3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={handleGracePeriodUpdate}
                  disabled={isUpdatingGracePeriod}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 !text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <RefreshCcw className="h-4 w-4" />
                  {isUpdatingGracePeriod ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
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
            <p className="mt-2">
              Enable SMS alerts for final grace period warnings. Current state:{" "}
              {locked ? "locked" : "unlocked"} / {triggered ? "triggered" : "idle"}.
            </p>
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
            Initiating a wallet change requires a multi-step verification to ensure the security of
            your digital testament. This will begin a 7-day security cooldown.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            You must confirm the new address from both your current wallet and a verified secondary
            recovery device.
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm shadow-slate-200/50">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Identity proof</p>
              <p className="mt-2 text-sm text-slate-500">
                Protects authorized changes to the recovery process.
              </p>
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