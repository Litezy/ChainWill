import { ShieldCheck } from "lucide-react";
import React, { useState } from "react";

import { useCallWriteMethods } from "@/hooks/contract/useCallWriteMethods";
import { useGasEstimator } from "@/hooks/contract/useGasEstimator";
import { useWillStatusStore } from "@/stores/willStatusStore";
import { dismissToast, loadingMessage, successMessage } from "@/utils/messageStatus";

const CheckinButton: React.FC = () => {
  const { callWriteFunction } = useCallWriteMethods("child");
  const { estimateGas } = useGasEstimator("child");
  const triggerRefresh = useWillStatusStore((state) => state.triggerRefresh);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const triggerUnlocksAt = useWillStatusStore((state) => state.triggerUnlocksAt);
  const triggered = useWillStatusStore((state) => state.triggered);
  const [now,] = useState(Date.now());

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    const toastId = loadingMessage("Submitting check-in...");

    try {
      const gas = await estimateGas("checkIn", []);
      if (!gas) return;

      const { success } = await callWriteFunction("checkIn", [], gas);
      if (!success) return;

      triggerRefresh();
      successMessage("Check-in completed");
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  const nowInSeconds = Math.floor(now / 1000);
  const gracePeriodExpired = triggered && triggerUnlocksAt > 0 && nowInSeconds >= triggerUnlocksAt;
  const gracePeriodActive = triggered && triggerUnlocksAt > 0 && nowInSeconds < triggerUnlocksAt;

  return (
    <button
      onClick={handleCheckIn}
      disabled={isSubmitting || gracePeriodExpired}
      className="inline-flex gap-2 disabled:bg-red-600 items-center justify-center whitespace-nowrap rounded-full bg-indigo-950 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-primary/90 !disabled:cursor-not-allowed disabled:opacity-70"
    >
      <span>
        <ShieldCheck size={20} className="text-white" />
      </span>

      {isSubmitting
        ? "Checking in..."
        : gracePeriodExpired
          ? "Grace period expired"
          : gracePeriodActive
            ? "Check in before timeout"
            : "I'm Alive Check-in"}
    </button>
  );
};

export default CheckinButton;
