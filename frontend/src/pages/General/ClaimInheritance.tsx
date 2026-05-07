import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { formatUnits, getAddress } from "ethers";
import { useAccount } from "wagmi";
import { AlertTriangle, Wallet, Coins, Loader2, CheckCircle2 } from "lucide-react";
import CustomConnectButton from "@/components/CustomConnectButton";
import { useCallReadMethods } from "@/hooks/contract/useCallReadMethods";
import { useCallWriteMethods } from "@/hooks/contract/useCallWriteMethods";
import { useGasEstimator } from "@/hooks/contract/useGasEstimator";
import {
  dismissToast,
  loadingMessage,
  successMessage,
} from "@/utils/messageStatus";

// ── helpers ───────────────────────────────────────────────────────────────────
const decodeContractAddress = (value: string | null): `0x${string}` | null => {
  if (!value) return null;
  try {
    return getAddress(decodeURIComponent(value).trim()) as `0x${string}`;
  } catch {
    return null;
  }
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

// ── types ─────────────────────────────────────────────────────────────────────
type RawWillStatus = {
  approvedAmount: bigint;
  ownerWalletBalance: bigint;
  effectivePullAmount: bigint;
  timeRemaining: bigint;
  attestationOpensAt: bigint;
  triggerUnlocksAt: bigint;
  triggered: boolean;
  locked: boolean;
  inactivityPeriod: bigint;
  lastCheckIn: bigint;
  gracePeriod: bigint;
  finalPool: bigint;
};

type RawOwnerProfile = [string, string, string];

type RawBeneficiary = {
  id: bigint;
  wallet: string;
  percent: bigint;
  claimed: boolean;
  claimedAt: bigint;
  name: string;
  email: string;
  role: string;
};

type OwnerProfile = {
  name: string;
  email: string;
  wallet: string;
};

type WillStatus = {
  triggered: boolean;
  locked: boolean;
  finalPool: bigint;
};

const MAX_PERCENT = 10_000n;

// ── guard ─────────────────────────────────────────────────────────────────────
const Guard = ({ title, message }: { title: string; message: string }) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
      <AlertTriangle className="mx-auto h-10 w-10 text-amber-600" />
      <h1 className="mt-6 text-xl font-semibold text-slate-950">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>
    </div>
  </div>
);

// ── page ──────────────────────────────────────────────────────────────────────
const ClaimInheritance = () => {
  const { email: emailParam } = useParams();
  const [searchParams] = useSearchParams();
  const { address, isConnected } = useAccount();

  // ── decode email + contract from URL ────────────────────────────────
  const beneficiaryEmail = useMemo(() => {
    const raw = emailParam ?? searchParams.get("email") ?? "";
    try {
      return normalizeEmail(decodeURIComponent(raw));
    } catch {
      return normalizeEmail(raw);
    }
  }, [emailParam, searchParams]);

  const childAddress =
    decodeContractAddress(searchParams.get("contract")) ??
    decodeContractAddress(searchParams.get("child")) ??
    decodeContractAddress(searchParams.get("will"));

  const resolvedChildAddress = childAddress ?? undefined;

  const { callReadFunction } = useCallReadMethods("child", resolvedChildAddress);
  const { callWriteFunction } = useCallWriteMethods("child", resolvedChildAddress);
  const { estimateGas } = useGasEstimator("child", resolvedChildAddress);

  // ── state ────────────────────────────────────────────────────────────
  const [beneficiary, setBeneficiary] = useState<RawBeneficiary | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [willStatus, setWillStatus] = useState<WillStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [beneficiaryError, setBeneficiaryError] = useState<string | null>(null);

  // ── fetch all beneficiaries, filter by email client-side ─────────────
  const fetchPageData = useCallback(async () => {
    if (!beneficiaryEmail || !resolvedChildAddress) return;

    setIsLoading(true);
    setBeneficiaryError(null);

    const [allBeneficiariesResult, ownerResult, tokenResult, willStatusResult] =
      await Promise.allSettled([
        callReadFunction<RawBeneficiary[]>("getBeneficiaries", []),
        callReadFunction<RawOwnerProfile>("getOwnerProfile", []),
        callReadFunction<string>("getToken", []),
        callReadFunction<RawWillStatus>("getWillStatus", []),
      ]);

    // ── beneficiary — filter client-side by normalized email ───────────
    if (
      allBeneficiariesResult.status === "fulfilled" &&
      allBeneficiariesResult.value
    ) {
      const match = allBeneficiariesResult.value.find(
        (b) => normalizeEmail(b.email) === beneficiaryEmail
      );

      if (match) {
        setBeneficiary(match);
      } else {
        setBeneficiaryError(
          `No beneficiary record found for "${beneficiaryEmail}" on this contract. ` +
          `Ensure you opened this page from the correct claim link sent to you.`
        );
      }
    } else {
      setBeneficiaryError(
        "Failed to load beneficiaries from the contract. Please try again."
      );
    }

    // ── owner profile ──────────────────────────────────────────────────
    if (ownerResult.status === "fulfilled" && ownerResult.value) {
      const [name, email, wallet] = ownerResult.value;
      setOwnerProfile({ name, email, wallet });
    }

    // ── token ──────────────────────────────────────────────────────────
    if (tokenResult.status === "fulfilled" && tokenResult.value) {
      setTokenAddress(tokenResult.value);
    }

    // ── will status ────────────────────────────────────────────────────
    if (willStatusResult.status === "fulfilled" && willStatusResult.value) {
      const s = willStatusResult.value;
      setWillStatus({
        triggered: s.triggered,
        locked: s.locked,
        finalPool: s.finalPool,
      });
    }

    setIsLoading(false);
  }, [beneficiaryEmail, resolvedChildAddress, callReadFunction]);

  useEffect(() => {
    void fetchPageData();
  }, [fetchPageData]);

  // ── derived ──────────────────────────────────────────────────────────
  const walletMatchesBeneficiary =
    !!address &&
    !!beneficiary &&
    address.toLowerCase() === beneficiary.wallet.toLowerCase();

  const claimAmount = useMemo(() => {
    if (!beneficiary || !willStatus) return 0n;
    return (willStatus.finalPool * beneficiary.percent) / MAX_PERCENT;
  }, [beneficiary, willStatus]);

  const formattedClaimAmount = useMemo(
    () => Number(formatUnits(claimAmount, 18)).toLocaleString(),
    [claimAmount]
  );

  const canClaim =
    !!beneficiary &&
    !!willStatus?.triggered &&
    isConnected &&
    walletMatchesBeneficiary &&
    !beneficiary.claimed;

  // ── claim handler ────────────────────────────────────────────────────
  const handleClaim = async () => {
    if (!beneficiary) return;

    const toastId = loadingMessage("Estimating gas...");
    setIsClaiming(true);

    try {
      const gas = await estimateGas("claim", [Number(beneficiary.id)]);
      if (!gas) return;

      loadingMessage("Submitting claim...");
      const { success } = await callWriteFunction(
        "claim",
        [Number(beneficiary.id)],
        gas
      );
      if (!success) return;

      successMessage("Inheritance claimed successfully");
      await fetchPageData();
    } finally {
      dismissToast(toastId);
      setIsClaiming(false);
    }
  };

  // ── add token to wallet ──────────────────────────────────────────────
  const addTokenToWallet = async () => {
    if (!window.ethereum || !tokenAddress) return;
    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: { address: tokenAddress, symbol: "CWT", decimals: 18 },
        },
      });
    } catch {
      // no-op
    }
  };

  // ── URL guards ───────────────────────────────────────────────────────
  if (!beneficiaryEmail) {
    return (
      <Guard
        title="Missing beneficiary email"
        message="Open this page from the claim link sent to your email."
      />
    );
  }

  if (!childAddress) {
    return (
      <Guard
        title="Missing contract address"
        message="Open this page from the claim link. The will contract address must be present in the URL."
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* ── header ─────────────────────────────────────────────────── */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Coins className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-950">
              Claim Your Inheritance
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Connect the wallet registered as your beneficiary address to claim.
            </p>
            <p className="mt-2 text-xs font-medium text-primary">
              {beneficiaryEmail}
            </p>
          </div>
        </div>

        {/* ── loading ─────────────────────────────────────────────────── */}
        {isLoading && (
          <div className="flex items-center justify-center rounded-[28px] border border-slate-200 bg-white p-10 shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-3 text-sm text-slate-500">
              Loading your beneficiary record...
            </span>
          </div>
        )}

        {/* ── beneficiary not found ────────────────────────────────────── */}
        {!isLoading && beneficiaryError && (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <p className="text-sm font-semibold text-rose-700">
                  Beneficiary not found
                </p>
                <p className="mt-1 text-sm text-rose-600">
                  {beneficiaryError}
                </p>
                <div className="mt-3 space-y-1 text-xs text-rose-400">
                  <p>Email: <span className="font-mono">{beneficiaryEmail}</span></p>
                  <p className="break-all">Contract: <span className="font-mono">{childAddress}</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── main content — only when beneficiary loaded ──────────────── */}
        {!isLoading && beneficiary && (
          <>
            {/* profiles */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Testator
                </p>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-950">Name:</span>{" "}
                    {ownerProfile?.name ?? "—"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-950">Email:</span>{" "}
                    {ownerProfile?.email ?? "—"}
                  </p>
                  <p className="break-all">
                    <span className="font-semibold text-slate-950">Wallet:</span>{" "}
                    {ownerProfile?.wallet ?? "—"}
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Your Beneficiary Record
                </p>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-950">Name:</span>{" "}
                    {beneficiary.name}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-950">Role:</span>{" "}
                    {beneficiary.role}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-950">Allocation:</span>{" "}
                    {Number(beneficiary.percent) / 100}%
                  </p>
                  <p className="break-all">
                    <span className="font-semibold text-slate-950">Registered Wallet:</span>{" "}
                    <span className="font-mono text-xs">{beneficiary.wallet}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* claim details */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Claim Details
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-950">Will Executed:</span>{" "}
                      <span className={willStatus?.triggered ? "text-emerald-600 font-semibold" : "text-amber-600"}>
                        {willStatus?.triggered ? "Yes" : "Not yet"}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-slate-950">Claimed:</span>{" "}
                      <span className={beneficiary.claimed ? "text-emerald-600 font-semibold" : "text-slate-500"}>
                        {beneficiary.claimed ? "Yes" : "No"}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-slate-950">Your Share:</span>{" "}
                      <span className="text-primary font-semibold">
                        {formattedClaimAmount} CWT
                      </span>
                    </p>
                    {beneficiary.claimedAt > 0n && (
                      <p>
                        <span className="font-semibold text-slate-950">Claimed At:</span>{" "}
                        {new Date(Number(beneficiary.claimedAt) * 1000).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Token
                  </p>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p className="break-all font-mono text-xs text-slate-500">
                      {tokenAddress || "—"}
                    </p>
                    {tokenAddress && (
                      <button
                        type="button"
                        onClick={() => void addTokenToWallet()}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Wallet className="h-4 w-4" />
                        Add CWT to Wallet
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── connect + claim ──────────────────────────────────────── */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              {!isConnected ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Connect your wallet to claim
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      You must connect{" "}
                      <span className="font-mono">
                        {beneficiary.wallet.slice(0, 6)}...{beneficiary.wallet.slice(-4)}
                      </span>{" "}
                      — the wallet registered on-chain for this beneficiary.
                    </p>
                  </div>
                  <CustomConnectButton
                    title="Connect Wallet"
                    className="w-full py-3"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* connected wallet info */}
                  <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-4">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${walletMatchesBeneficiary ? "bg-emerald-100" : "bg-amber-100"}`}>
                      {walletMatchesBeneficiary
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        : <AlertTriangle className="h-4 w-4 text-amber-600" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Connected wallet</p>
                      <p className="truncate font-mono text-xs text-slate-700">{address}</p>
                    </div>
                  </div>

                  {/* wrong wallet warning */}
                  {!walletMatchesBeneficiary && (
                    <div className="rounded-3xl bg-amber-50 p-4 text-sm text-amber-700">
                      Wrong wallet connected. This claim requires{" "}
                      <span className="font-mono font-semibold">
                        {beneficiary.wallet.slice(0, 6)}...{beneficiary.wallet.slice(-4)}
                      </span>
                      . Switch wallets and reconnect.
                    </div>
                  )}

                  {/* will not triggered */}
                  {!willStatus?.triggered && (
                    <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                      The will has not been executed yet. Admin must trigger
                      and signers must complete attestation before claims open.
                    </div>
                  )}

                  {/* already claimed */}
                  {beneficiary.claimed && (
                    <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      You have already claimed {formattedClaimAmount} CWT from this will.
                    </div>
                  )}

                  {/* claim button */}
                  <button
                    type="button"
                    onClick={() => void handleClaim()}
                    disabled={!canClaim || isClaiming}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isClaiming
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Claiming...</>
                      : beneficiary.claimed
                      ? "Already Claimed"
                      : `Claim ${formattedClaimAmount} CWT`}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <p className="text-center text-xs text-slate-400 pb-4">
          Secured by ChainWill Protocol · Claim is irreversible once submitted
        </p>
      </div>
    </div>
  );
};

export default ClaimInheritance;