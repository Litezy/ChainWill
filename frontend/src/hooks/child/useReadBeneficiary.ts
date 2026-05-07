import { useCallback, useEffect, useState } from "react";
import { useContract } from "@/hooks/contract/useContract";
import { useCallWriteMethods } from "@/hooks/contract/useCallWriteMethods";
import { useGasEstimator } from "@/hooks/contract/useGasEstimator";
import { useBeneficiaryStore, type BeneficiaryRecord } from "@/stores/beneficiaryStore";
import { useContractStore } from "@/stores/contractStore";
import {
  dismissToast,
  errorMessage,
  loadingMessage,
  successMessage,
} from "@/utils/messageStatus";

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

type AddBeneficiaryInput = {
  wallet: string;
  percent: number;
  name: string;
  email: string;
  role: string;
};

type UpdateBeneficiaryInput = AddBeneficiaryInput & {
  id: number;
};

const MAX_PERCENT_BPS = 10_000;

const mapBeneficiary = (item: RawBeneficiary): BeneficiaryRecord => ({
  id: Number(item.id),
  wallet: item.wallet,
  percentBps: Number(item.percent),
  claimed: item.claimed,
  claimedAt: Number(item.claimedAt),
  name: item.name,
  email: item.email,
  role: item.role,
});

export const useReadBeneficiary = (childAddress?: string) => {
  const readContract = useContract({
    type: "child",
    withSigner: false,
    address: childAddress,
  });
  const { callWriteFunction } = useCallWriteMethods("child", childAddress);
  const { estimateGas } = useGasEstimator("child", childAddress);
  const { triggerRefresh, refreshKey } = useContractStore();

  const beneficiaries = useBeneficiaryStore((state) => state.beneficiaries);
  const remainingPercentBps = useBeneficiaryStore(
    (state) => state.remainingPercentBps
  );
  const isLoading = useBeneficiaryStore((state) => state.isLoading);
  const setBeneficiaries = useBeneficiaryStore((state) => state.setBeneficiaries);
  const setRemainingPercentBps = useBeneficiaryStore(
    (state) => state.setRemainingPercentBps
  );
  const setLoading = useBeneficiaryStore((state) => state.setLoading);
  const setError = useBeneficiaryStore((state) => state.setError);
  const removeStoredBeneficiary = useBeneficiaryStore(
    (state) => state.removeBeneficiary
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBeneficiaries = useCallback(async () => {
    if (!readContract) return;

    setLoading(true);
    setError(null);

    try {
      const [rawBeneficiaries, rawRemainingPercent] = await Promise.all([
        readContract.getBeneficiaries(),
        readContract.remainingPercent(),
      ]);

      setBeneficiaries((rawBeneficiaries as RawBeneficiary[]).map(mapBeneficiary));
      setRemainingPercentBps(Number(rawRemainingPercent));
    } catch (error) {
      console.error("Failed to fetch beneficiaries", error);
      setError(error instanceof Error ? error.message : "Failed to fetch beneficiaries");
    } finally {
      setLoading(false);
    }
  }, [readContract, setBeneficiaries, setError, setLoading, setRemainingPercentBps]);

  useEffect(() => {
    void fetchBeneficiaries();
  }, [fetchBeneficiaries, refreshKey]);

  const addBeneficiary = async (input: AddBeneficiaryInput) => {
    const percentBps = Math.round(input.percent * 100);
    if (percentBps <= 0 || percentBps > remainingPercentBps) {
      errorMessage("Allocation exceeds remaining percentage");
      return false;
    }

    const toastId = loadingMessage("Estimating gas...");
    setIsSubmitting(true);

    try {
      const method = "addBeneficiary(address,uint256,string,string,string)";
      const args = [input.wallet, percentBps, input.name, input.email, input.role];
      const gas = await estimateGas(method, args);
      if (!gas) return false;

      loadingMessage("Adding beneficiary...");
      const { success, receipt } = await callWriteFunction(method, args, gas);
      if (!success || !receipt) return false;

      successMessage("Beneficiary added successfully");
      triggerRefresh();
      await fetchBeneficiaries();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  const updateBeneficiary = async (input: UpdateBeneficiaryInput) => {
    const current = beneficiaries.find((item) => item.id === input.id);
    if (!current) {
      errorMessage("Beneficiary not found");
      return false;
    }

    const percentBps = Math.round(input.percent * 100);
    const allowedPercentBps = remainingPercentBps + current.percentBps;
    if (percentBps <= 0 || percentBps > allowedPercentBps) {
      errorMessage("Allocation exceeds remaining percentage");
      return false;
    }

    const toastId = loadingMessage("Estimating gas...");
    setIsSubmitting(true);

    try {
      const method =
        "updateBeneficiary(uint256,address,uint256,string,string,string)";
      const args = [
        input.id,
        input.wallet,
        percentBps,
        input.name,
        input.email,
        input.role,
      ];
      const gas = await estimateGas(method, args);
      if (!gas) return false;

      loadingMessage("Updating beneficiary...");
      const { success, receipt } = await callWriteFunction(method, args, gas);
      if (!success || !receipt) return false;

      successMessage("Beneficiary updated successfully");
      triggerRefresh();
      await fetchBeneficiaries();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  const removeBeneficiary = async (id: number) => {
    const toastId = loadingMessage("Estimating gas...");
    setIsSubmitting(true);

    try {
      const method = "removeBeneficiary(uint256)";
      const args = [id];
      const gas = await estimateGas(method, args);
      if (!gas) return false;

      loadingMessage("Removing beneficiary...");
      const { success, receipt } = await callWriteFunction(method, args, gas);
      if (!success || !receipt) return false;

      removeStoredBeneficiary(id);
      successMessage("Beneficiary removed successfully");
      triggerRefresh();
      await fetchBeneficiaries();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  return {
    beneficiaries,
    remainingPercentBps,
    remainingPercent: remainingPercentBps / 100,
    allocatedPercentBps: MAX_PERCENT_BPS - remainingPercentBps,
    allocatedPercent: (MAX_PERCENT_BPS - remainingPercentBps) / 100,
    isLoading,
    isSubmitting,
    fetchBeneficiaries,
    addBeneficiary,
    updateBeneficiary,
    removeBeneficiary,
  };
};
