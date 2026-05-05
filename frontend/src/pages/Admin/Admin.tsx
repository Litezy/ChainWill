import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShieldAlert, ShieldCheck, Clock, RefreshCcw, Zap, AlertTriangle } from "lucide-react";
import { useWillStatus } from "@/hooks/child/useWillStatus";
import { useCallWriteMethods } from "@/hooks/contract/useCallWriteMethods";
import { useGasEstimator } from "@/hooks/contract/useGasEstimator";
import { useWillStatusStore } from "@/stores/willStatusStore";
import {
  dismissToast,
  errorMessage,
  loadingMessage,
  successMessage,
} from "@/utils/messageStatus";
import { formatCountdown, formatUnixDateTime, getSecondsUntil } from "@/utils/willStatus";

const ADMIN_WALLET = "0x776033F935cBb708891b1353F596725f9FfE632b";
const CHILD_CONTRACT = "0x72368398a14d3F7b22a41f030F538Ac2890Ea54d";

// ── Not Admin Screen ──────────────────────────────────────────────────────────
const NotAdmin = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div className="max-w-md w-full rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
        <ShieldAlert className="h-8 w-8 text-rose-600" />
      </div>
      <h1 className="mt-6 text-xl font-semibold text-slate-950">Access Denied</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        This page is restricted to authorized administrators only. If you believe this is an error,
        contact the protocol owner.
      </p>
      <div className="mt-6 rounded-3xl bg-slate-50 px-4 py-3 text-xs font-mono text-slate-400 break-all">
        No valid admin wallet provided in URL
      </div>
    </div>
  </div>
);

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ active, label }: { active: boolean; label: string }) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
      active
        ? "bg-emerald-100 text-emerald-700"
        : "bg-slate-100 text-slate-500"
    }`}
  >
    {label}
  </span>
);

// ── Info Row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-3 text-sm border-b border-slate-100 last:border-0">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold text-slate-950">{value}</span>
  </div>
);

// ── Admin Page ────────────────────────────────────────────────────────────────
const Admin = () => {
  const [searchParams] = useSearchParams();
  const walletParam = searchParams.get("wallet");

  const isAdmin =
    walletParam?.toLowerCase() === ADMIN_WALLET.toLowerCase();

  if (!isAdmin) return <NotAdmin />;

  return <AdminDashboard />;
};

// ── Admin Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { refetch } = useWillStatus(CHILD_CONTRACT);
  const { callWriteFunction } = useCallWriteMethods("child", CHILD_CONTRACT);
  const { estimateGas } = useGasEstimator("child", CHILD_CONTRACT);

  const isLoading = useWillStatusStore((s) => s.isLoading);
  const triggered = useWillStatusStore((s) => s.triggered);
  const locked = useWillStatusStore((s) => s.locked);
  const triggerUnlocksAt = useWillStatusStore((s) => s.triggerUnlocksAt);
  const attestationOpensAt = useWillStatusStore((s) => s.attestationOpensAt);
  const timeRemaining = useWillStatusStore((s) => s.timeRemaining);
  const lastUpdatedAt = useWillStatusStore((s) => s.lastUpdatedAt);
  const finalPool = useWillStatusStore((s) => s.finalPool);

  const [now, setNow] = useState(Date.now());
  const [isTriggering, setIsTriggering] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const nowInSeconds = Math.floor(now / 1000);

  const gracePeriodExpired =
    triggered && triggerUnlocksAt > 0 && nowInSeconds >= triggerUnlocksAt;
  const gracePeriodActive =
    triggered && triggerUnlocksAt > 0 && nowInSeconds < triggerUnlocksAt;

  const gracePeriodCountdown = !triggered
    ? "Not started"
    : gracePeriodExpired
    ? "Expired"
    : gracePeriodActive
    ? formatCountdown(triggerUnlocksAt - nowInSeconds)
    : "0s";

  // show trigger button only when grace period has elapsed (triggerUnlocksAt passed)
  // and the will hasn't already been triggered
  const canTrigger = gracePeriodExpired && !triggered;

  const handleTriggerByTime = async () => {
    const toastId = loadingMessage("Estimating gas...");
    setIsTriggering(true);

    try {
      const gas = await estimateGas("triggerByTime", []);
      if (!gas) return;

      loadingMessage("Triggering will by time...");

      const success = await callWriteFunction("triggerByTime", [], gas);
      if (!success) return;

      successMessage("Will triggered successfully. Signers can now attest.");
      refetch();
    } finally {
      dismissToast(toastId);
      setIsTriggering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">ChainWill Admin</p>
              <p className="text-xs text-slate-400 font-mono truncate max-w-[200px]">
                {ADMIN_WALLET}
              </p>
            </div>
          </div>
          <button
            onClick={refetch}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">

        {/* Contract Address */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">Monitored Contract</p>
          <p className="mt-2 font-mono text-sm text-slate-700 break-all">{CHILD_CONTRACT}</p>
        </div>

        {/* Status Overview */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Will Status</p>
              <p className="mt-1 text-base font-semibold text-slate-950">Current state</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge active={triggered} label={triggered ? "Triggered" : "Idle"} />
              <StatusBadge active={locked} label={locked ? "Locked" : "Unlocked"} />
            </div>
          </div>

          <div className="mt-6 divide-y divide-slate-100">
            <InfoRow
              label="Grace period"
              value={isLoading ? "Loading..." : gracePeriodCountdown}
            />
            <InfoRow
              label="Attestation opens"
              value={isLoading ? "Loading..." : formatUnixDateTime(attestationOpensAt)}
            />
            <InfoRow
              label="Trigger unlocks at"
              value={isLoading ? "Loading..." : formatUnixDateTime(triggerUnlocksAt)}
            />
            <InfoRow
              label="Final pool"
              value={isLoading ? "Loading..." : `${finalPool} CWT`}
            />
          </div>
        </div>

        {/* Trigger Panel */}
        <div
          className={`rounded-[28px] border p-6 shadow-sm ${
            canTrigger
              ? "border-primary/30 bg-primary/5"
              : gracePeriodActive
              ? "border-amber-200 bg-amber-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                canTrigger
                  ? "bg-primary/10"
                  : gracePeriodActive
                  ? "bg-amber-100"
                  : "bg-slate-100"
              }`}
            >
              {canTrigger ? (
                <Zap className="h-5 w-5 text-primary" />
              ) : gracePeriodActive ? (
                <Clock className="h-5 w-5 text-amber-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-950">
                {canTrigger
                  ? "Grace period has elapsed — ready to trigger"
                  : gracePeriodActive
                  ? "Grace period is still active"
                  : triggered
                  ? "Will has already been triggered"
                  : "Will has not entered grace period yet"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {canTrigger
                  ? "Clicking trigger will call triggerByTime() on the contract, allowing signers to begin attestation."
                  : gracePeriodActive
                  ? `Time remaining in grace period: ${gracePeriodCountdown}. The trigger button will appear once it elapses.`
                  : triggered
                  ? "Signers can now attest. No further admin action is needed."
                  : "Monitor this page — the trigger button will appear automatically once the grace period elapses."}
              </p>

              {canTrigger && (
                <button
                  onClick={handleTriggerByTime}
                  disabled={isTriggering}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Zap className="h-4 w-4" />
                  {isTriggering ? "Triggering..." : "Trigger by Time"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 pb-4">
          Admin actions are on-chain and irreversible. Ensure contract state is correct before triggering.
        </p>
      </div>
    </div>
  );
};

export default Admin;