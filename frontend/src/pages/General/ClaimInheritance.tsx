import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { formatUnits, getAddress } from "ethers";
import { useAccount } from "wagmi";
import { AlertTriangle, Coins } from "lucide-react";
import Loader from "@/components/Loader";

import { useCallReadMethods } from "@/hooks/contract/useCallReadMethods";
import { useCallWriteMethods } from "@/hooks/contract/useCallWriteMethods";
import { useGasEstimator } from "@/hooks/contract/useGasEstimator";
import { dismissToast, loadingMessage, successMessage } from "@/utils/messageStatus";

import BeneficiaryCard from "@/components/beneficiary/BeneficiaryCard";
import WalletChangePanel from "@/components/beneficiary/WalletChangePanel";
import ClaimPanel from "@/components/beneficiary/ClaimPanel";
import type {
  RawBeneficiary,
  RawOwnerProfile,
  RawWillStatus,
  OwnerProfile,
  WillStatus,
} from "@/types";

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

  // ── fetch all data ────────────────────────────────────────────────────
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

    // beneficiary — filter client-side by normalized email
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

    if (ownerResult.status === "fulfilled" && ownerResult.value) {
      const [name, email, wallet] = ownerResult.value;
      setOwnerProfile({ name, email, wallet });
    }

    if (tokenResult.status === "fulfilled" && tokenResult.value) {
      setTokenAddress(tokenResult.value);
    }

    if (willStatusResult.status === "fulfilled" && willStatusResult.value) {
      const s = willStatusResult.value;
      setWillStatus({ triggered: s.triggered, locked: s.locked, finalPool: s.finalPool });
    }

    setIsLoading(false);
  }, [beneficiaryEmail, resolvedChildAddress, callReadFunction]);

  useEffect(() => {
    void fetchPageData();
  }, [fetchPageData]);

  // ── derived ──────────────────────────────────────────────────────────
  const claimAmount = useMemo(() => {
    if (!beneficiary || !willStatus) return 0n;
    return (willStatus.finalPool * beneficiary.percent) / MAX_PERCENT;
  }, [beneficiary, willStatus]);

  const formattedClaimAmount = useMemo(
    () => Number(formatUnits(claimAmount, 18)).toLocaleString(),
    [claimAmount]
  );

  // ── claim handler ─────────────────────────────────────────────────────
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

  // ── add token to wallet ───────────────────────────────────────────────
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

  // ── URL guards ────────────────────────────────────────────────────────
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

        {/* header */}
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

        {/* loading */}
        {isLoading && (
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <Loader
              isLoading
              variant="spinner"
              size="sm"
              text="Loading your beneficiary record…"
              fullScreen={false}
              overlay={false}
            />
          </div>
        )}

        {/* beneficiary not found */}
        {!isLoading && beneficiaryError && (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <p className="text-sm font-semibold text-rose-700">
                  Beneficiary not found
                </p>
                <p className="mt-1 text-sm text-rose-600">{beneficiaryError}</p>
                <div className="mt-3 space-y-1 text-xs text-rose-400">
                  <p>
                    Email: <span className="font-mono">{beneficiaryEmail}</span>
                  </p>
                  <p className="break-all">
                    Contract: <span className="font-mono">{childAddress}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* main content — only when beneficiary loaded */}
        {!isLoading && beneficiary && (
          <>
            {/* 1. Beneficiary info cards */}
            <BeneficiaryCard
              ownerProfile={ownerProfile}
              beneficiary={beneficiary}
              willStatus={willStatus}
              tokenAddress={tokenAddress}
              formattedClaimAmount={formattedClaimAmount}
              onAddTokenToWallet={() => void addTokenToWallet()}
            />

            {/* 2. Optional: change registered wallet */}
            <WalletChangePanel
              currentWallet={beneficiary.wallet}
              onWalletChanged={fetchPageData}
              callWriteFunction={callWriteFunction}
              estimateGas={estimateGas}
            />

            {/* 3. Connect → OTP → Claim flow */}
            <ClaimPanel
              beneficiary={beneficiary}
              willStatus={willStatus}
              address={address}
              isConnected={isConnected}
              isClaiming={isClaiming}
              formattedClaimAmount={formattedClaimAmount}
              onClaim={handleClaim}
            />
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