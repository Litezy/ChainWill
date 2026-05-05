import { useEffect } from "react";

import { CHAINWILL_CONTRACT } from "@/constants/contract";
import { useCallReadMethods } from "@/hooks/contract/useCallReadMethods";
import { useWillStatusStore } from "@/stores/willStatusStore";

type RawWillStatus = {
  approvedAmount: bigint;
  ownerWalletBalance: bigint;
  effectivePullAmount: bigint;
  timeRemaining: bigint;
  attestationOpensAt: bigint;
  triggerUnlocksAt: bigint;
  triggered: boolean;
  locked: boolean;
  finalPool: bigint;
};

export const useWillStatus = (childAddress = CHAINWILL_CONTRACT) => {
  const { callReadFunction } = useCallReadMethods("child", childAddress);
  const refreshKey = useWillStatusStore((state) => state.refreshKey);
  const setWillStatus = useWillStatusStore((state) => state.setWillStatus);
  const setLoading = useWillStatusStore((state) => state.setLoading);
  const setError = useWillStatusStore((state) => state.setError);

  const fetchWillStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await callReadFunction("getWillStatus", []);
      if (!result) return;

      const status = result as RawWillStatus;

      setWillStatus({
        approvedAmount: status.approvedAmount.toString(),
        ownerWalletBalance: status.ownerWalletBalance.toString(),
        effectivePullAmount: status.effectivePullAmount.toString(),
        timeRemaining: Number(status.timeRemaining),
        attestationOpensAt: Number(status.attestationOpensAt),
        triggerUnlocksAt: Number(status.triggerUnlocksAt),
        triggered: status.triggered,
        locked: status.locked,
        finalPool: status.finalPool.toString(),
      });
    } catch (error) {
      console.error("Failed to fetch will status:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch will status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWillStatus();
  }, [childAddress, refreshKey]);

  return { refetch: fetchWillStatus };
};