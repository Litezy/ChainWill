import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAddress } from "ethers";
import { useAccount } from "wagmi";
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  RefreshCcw,
  Zap,
  Mail,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useWillStatus } from "@/hooks/child/useWillStatus";
import { useCallReadMethods } from "@/hooks/contract/useCallReadMethods";
import { useCallWriteMethods } from "@/hooks/contract/useCallWriteMethods";
import { useGasEstimator } from "@/hooks/contract/useGasEstimator";
import { useWillStatusStore } from "@/stores/willStatusStore";
import {
  dismissToast,
  errorMessage,
  loadingMessage,
  successMessage,
} from "@/utils/messageStatus";
import { formatCountdown, formatUnixDateTime } from "@/utils/willStatus";
import CustomConnectButton from "@/components/CustomConnectButton";

const ADMIN_WALLET = "0x776033F935cBb708891b1353F596725f9FfE632b";

const decodeContractAddress = (value: string | null): `0x${string}` | null => {
  if (!value) return null;

  try {
    return getAddress(decodeURIComponent(value).trim()) as `0x${string}`;
  } catch {
    return null;
  }
};

type AttestationStatus = {
  available: boolean;
  count: bigint;
  required: bigint;
};

type RawSigner = {
  id: bigint;
  wallet: string;
  signed: boolean;
  signedAt: bigint;
  name: string;
  email: string;
};

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

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm last:border-0">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold text-slate-950">{value}</span>
  </div>
);

const NotAdmin = ({ address }: { address?: string }) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
        <ShieldAlert className="h-8 w-8 text-rose-600" />
      </div>
      <h1 className="mt-6 text-xl font-semibold text-slate-950">Access Denied</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Connect the admin wallet to open attestation for signers.
      </p>
      {address ? (
        <div className="mt-6 rounded-3xl bg-slate-50 px-4 py-3 text-xs font-mono text-slate-400 break-all">
          Connected wallet: {address}
        </div>
      ) : (
        <div className="mt-6">
          <CustomConnectButton title="Connect Admin Wallet" className="w-full py-4" />
        </div>
      )}
    </div>
  </div>
);

const MissingContract = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
        <AlertTriangle className="h-8 w-8 text-amber-600" />
      </div>
      <h1 className="mt-6 text-xl font-semibold text-slate-950">Missing Contract Address</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Pass the will contract in the URL so admin can fetch signers and open attestation.
      </p>
      <div className="mt-6 rounded-3xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
        Example: <span className="font-mono">/admin?contract=0x...</span>
      </div>
    </div>
  </div>
);

const Admin = () => {
  const [searchParams] = useSearchParams();
  const { address, isConnected } = useAccount();
  const childAddress =
    decodeContractAddress(searchParams.get("contract")) ??
    decodeContractAddress(searchParams.get("child")) ??
    decodeContractAddress(searchParams.get("will"));

  const isAdmin =
    !!address && address.toLowerCase() === ADMIN_WALLET.toLowerCase();

  if (!isConnected || !isAdmin) {
    return <NotAdmin address={address} />;
  }

  if (!childAddress) {
    return <MissingContract />;
  }

  return <AdminDashboard childAddress={childAddress} />;
};

const AdminDashboard = ({ childAddress }: { childAddress: `0x${string}` }) => {
  const { refetch } = useWillStatus(childAddress);
  const { callReadFunction } = useCallReadMethods("child", childAddress);
  const { callWriteFunction } = useCallWriteMethods("child", childAddress);
  const { estimateGas } = useGasEstimator("child", childAddress);

  const isLoading = useWillStatusStore((s) => s.isLoading);
  const triggered = useWillStatusStore((s) => s.triggered);
  const locked = useWillStatusStore((s) => s.locked);
  const triggerUnlocksAt = useWillStatusStore((s) => s.triggerUnlocksAt);
  const attestationOpensAt = useWillStatusStore((s) => s.attestationOpensAt);
  const finalPool = useWillStatusStore((s) => s.finalPool);

  const [now, setNow] = useState(() => Date.now());
  const [isTriggering, setIsTriggering] = useState(false);
  const [attestation, setAttestation] = useState<AttestationStatus | null>(null);
  const [signerEmails, setSignerEmails] = useState<string[]>([]);

  const fetchPageData = useCallback(async () => {
    await refetch();

    const [attestationResult, signersResult] = await Promise.all([
      callReadFunction<[boolean, bigint, bigint]>("getAttestationStatus", []),
      callReadFunction<RawSigner[]>("getSignersWithDetails", []),
    ]);

    if (attestationResult) {
      const [available, count, required] = attestationResult;
      setAttestation({ available, count, required });
    }

    if (signersResult) {
      setSignerEmails(
        signersResult
          .map((item) => item.email)
          .filter((email): email is string => !!email)
      );
    }
  }, [callReadFunction, refetch]);

  useEffect(() => {
    void fetchPageData();
  }, [fetchPageData]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const nowInSeconds = Math.floor(now / 1000);
  const gracePeriodExpired = triggerUnlocksAt > 0 && nowInSeconds >= triggerUnlocksAt;
  const canOpenAttestation =
    gracePeriodExpired && !attestation?.available && !triggered;

  const gracePeriodCountdown = triggerUnlocksAt
    ? gracePeriodExpired
      ? "Expired"
      : formatCountdown(triggerUnlocksAt - nowInSeconds)
    : "Unknown";

  const signerNotificationPayload = useMemo(
    () => ({
      contractAddress: childAddress,
      signerEmails,
    }),
    [childAddress, signerEmails]
  );

  const handleTriggerByTime = async () => {
    const toastId = loadingMessage("Estimating gas...");
    setIsTriggering(true);

    try {
      const gas = await estimateGas("triggerByTime", []);
      if (!gas) return;

      loadingMessage("Opening attestation...");
      const { success } = await callWriteFunction("triggerByTime", [], gas);
      if (!success) return;

      successMessage("Attestation opened. Signers can now attest.");
      await fetchPageData();
    } finally {
      dismissToast(toastId);
      setIsTriggering(false);
    }
  };

  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(signerNotificationPayload, null, 2)
      );
      successMessage("Signer notification payload copied");
    } catch {
      errorMessage("Failed to copy payload");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">ChainWill Admin</p>
              <p className="text-xs font-mono text-slate-400 truncate max-w-[220px]">
                {ADMIN_WALLET}
              </p>
            </div>
          </div>
          <button
            onClick={() => void fetchPageData()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">Monitored Contract</p>
          <p className="mt-2 break-all font-mono text-sm text-slate-700">{childAddress}</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Will Lifecycle</p>
              <p className="mt-1 text-base font-semibold text-slate-950">
                Admin opens attestation, signers execute trigger, beneficiaries claim after execution
              </p>
            </div>
            <div className="flex gap-2">
              <StatusBadge active={!!attestation?.available} label={attestation?.available ? "Attestation Open" : "Attestation Closed"} />
              <StatusBadge active={triggered} label={triggered ? "Triggered" : "Not Triggered"} />
              <StatusBadge active={locked} label={locked ? "Locked" : "Unlocked"} />
            </div>
          </div>

          <div className="mt-6 divide-y divide-slate-100">
            <InfoRow
              label="Grace period"
              value={isLoading ? "Loading..." : gracePeriodCountdown}
            />
            <InfoRow
              label="Attestation opens at"
              value={isLoading ? "Loading..." : formatUnixDateTime(attestationOpensAt)}
            />
            <InfoRow
              label="Execution unlocks at"
              value={isLoading ? "Loading..." : formatUnixDateTime(triggerUnlocksAt)}
            />
            <InfoRow
              label="Attestation count"
              value={
                attestation
                  ? `${Number(attestation.count)} / ${Number(attestation.required)}`
                  : "Loading..."
              }
            />
            <InfoRow
              label="Claim pool after signer execution"
              value={isLoading ? "Loading..." : finalPool}
            />
          </div>
        </div>

        <div
          className={`rounded-[28px] border p-6 shadow-sm ${
            canOpenAttestation
              ? "border-primary/30 bg-primary/5"
              : attestation?.available && !triggered
              ? "border-amber-200 bg-amber-50"
              : triggered
              ? "border-emerald-200 bg-emerald-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                canOpenAttestation
                  ? "bg-primary/10"
                  : attestation?.available && !triggered
                  ? "bg-amber-100"
                  : triggered
                  ? "bg-emerald-100"
                  : "bg-slate-100"
              }`}
            >
              {triggered ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : canOpenAttestation ? (
                <Zap className="h-5 w-5 text-primary" />
              ) : (
                <Clock className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-950">
                {triggered
                  ? "Signer threshold met. Beneficiaries can now claim."
                  : attestation?.available
                  ? "Attestation is open. Waiting for signers to execute the trigger."
                  : canOpenAttestation
                  ? "Grace period elapsed. Open attestation for signers now."
                  : "Grace period still running."}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {triggered
                  ? "No further admin action is needed. The will has been executed by signers and claims are now available."
                  : attestation?.available
                  ? "This page now exposes signer emails so the backend can notify them to attest."
                  : canOpenAttestation
                  ? "Calling triggerByTime opens the attestation window. It does not release claims until signers attest and execute the trigger."
                  : `Attestation cannot be opened yet. Time left before admin action is allowed: ${gracePeriodCountdown}.`}
              </p>

              {canOpenAttestation ? (
                <button
                  onClick={() => void handleTriggerByTime()}
                  disabled={isTriggering}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Zap className="h-4 w-4" />
                  {isTriggering ? "Opening Attestation..." : "Trigger By Time"}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Signer Notification Payload</p>
              <p className="mt-1 text-base font-semibold text-slate-950">
                Email list prepared for backend delivery
              </p>
            </div>
            <button
              type="button"
              onClick={() => void copyPayload()}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Mail className="h-4 w-4" />
              Copy Payload
            </button>
          </div>

          <div className="mt-4 rounded-3xl bg-slate-50 p-4">
            <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-slate-600">
              {JSON.stringify(signerNotificationPayload, null, 2)}
            </pre>
          </div>
        </div>

        <p className="pb-4 text-center text-xs text-slate-400">
          Admin only opens attestation. Claims should remain closed until signers complete execution on-chain.
        </p>
      </div>
    </div>
  );
};

export default Admin;
