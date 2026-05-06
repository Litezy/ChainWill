
import { useCallback, useEffect } from "react";
import { useCallReadMethods } from "@/hooks/contract/useCallReadMethods";
import { useWillStatusStore } from "@/stores/willStatusStore";
import { useContractStore } from "@/stores/contractStore";

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

// ── module-level in-flight guard — shared across ALL hook instances ───────────
let isFetching = false;

export const useWillStatus = (childAddress?: string) => {
  const storedAddress = useContractStore((s) => s.contractAddress);
  const resolvedAddress = childAddress ?? storedAddress ?? undefined;

  const { callReadFunction } = useCallReadMethods("child", resolvedAddress);
  const refreshKey = useWillStatusStore((state) => state.refreshKey);
  const setWillStatus = useWillStatusStore((state) => state.setWillStatus);
  const setLoading = useWillStatusStore((state) => state.setLoading);
  const setError = useWillStatusStore((state) => state.setError);

  const fetchWillStatus = useCallback(async () => {
    if (!resolvedAddress) return;

    // ── skip if another instance is already fetching ──────────────────
    if (isFetching) return;
    isFetching = true;

    try {
      setLoading(true);
      setError(null);

      const result = await callReadFunction<RawWillStatus>("getWillStatus", []);
      if (!result) return;


      setWillStatus({
        approvedAmount: result.approvedAmount.toString(),
        ownerWalletBalance: result.ownerWalletBalance.toString(),
        effectivePullAmount: result.effectivePullAmount.toString(),
        timeRemaining: Number(result.timeRemaining),
        attestationOpensAt: Number(result.attestationOpensAt),
        triggerUnlocksAt: Number(result.triggerUnlocksAt),
        triggered: result.triggered,
        locked: result.locked,
        inactivityPeriod: Number(result.inactivityPeriod),
        lastCheckIn: Number(result.lastCheckIn),
        gracePeriod: Number(result.gracePeriod),
        finalPool: result.finalPool.toString(),
      });
    } catch (error) {
      console.error("Failed to fetch will status:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch will status");
    } finally {
      setLoading(false);
      isFetching = false; // ← release lock
    }
  }, [resolvedAddress, callReadFunction, setWillStatus, setLoading, setError]);

  useEffect(() => {
    fetchWillStatus();
  }, [fetchWillStatus, refreshKey]);

  return { refetch: fetchWillStatus };
};