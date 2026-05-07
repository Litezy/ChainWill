import { useCallback, useEffect, useState } from "react";
import { useContract } from "@/hooks/contract/useContract";
import { useCallWriteMethods } from "@/hooks/contract/useCallWriteMethods";
import { useGasEstimator } from "@/hooks/contract/useGasEstimator";
import { useSignerStore, type SignerRecord } from "@/stores/signerStore";
import { useContractStore } from "@/stores/contractStore";
import {
  dismissToast,
  errorMessage,
  loadingMessage,
  successMessage,
} from "@/utils/messageStatus";

type RawSigner = {
  id: bigint;
  wallet: string;
  signed: boolean;
  signedAt: bigint;
  name: string;
  email: string;
};

type ReplaceSignerInput = {
  oldSigner: string;
  newSigner: string;
  name: string;
  email: string;
};

const mapSigner = (item: RawSigner): SignerRecord => ({
  id: Number(item.id),
  wallet: item.wallet,
  signed: item.signed,
  signedAt: Number(item.signedAt),
  name: item.name,
  email: item.email,
});

export const useReadSigners = (childAddress?: string) => {
  const readContract = useContract({
    type: "child",
    withSigner: false,
    address: childAddress,
  });
  const { callWriteFunction } = useCallWriteMethods("child", childAddress);
  const { estimateGas } = useGasEstimator("child", childAddress);
  const { triggerRefresh, refreshKey } = useContractStore();

  const signers = useSignerStore((state) => state.signers);
  const isLoading = useSignerStore((state) => state.isLoading);
  const setSigners = useSignerStore((state) => state.setSigners);
  const setLoading = useSignerStore((state) => state.setLoading);
  const setError = useSignerStore((state) => state.setError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSigners = useCallback(async () => {
    if (!readContract) return;

    setLoading(true);
    setError(null);

    try {
      const rawSigners = await readContract.getSignersWithDetails();
      setSigners((rawSigners as RawSigner[]).map(mapSigner));
    } catch (error) {
      console.error("Failed to fetch signers", error);
      setError(error instanceof Error ? error.message : "Failed to fetch signers");
    } finally {
      setLoading(false);
    }
  }, [readContract, setError, setLoading, setSigners]);

  useEffect(() => {
    void fetchSigners();
  }, [fetchSigners, refreshKey]);

  const replaceSigner = async (input: ReplaceSignerInput) => {
    if (input.oldSigner.toLowerCase() === input.newSigner.toLowerCase()) {
      errorMessage("New signer wallet must be different");
      return false;
    }

    const toastId = loadingMessage("Estimating gas...");
    setIsSubmitting(true);

    try {
      const method = "replaceSigner(address,address,string,string)";
      const args = [
        input.oldSigner,
        input.newSigner,
        input.name,
        input.email,
      ];
      const gas = await estimateGas(method, args);
      if (!gas) return false;

      loadingMessage("Updating signer...");
      const { success, receipt } = await callWriteFunction(method, args, gas);
      if (!success || !receipt) return false;

      successMessage("Signer updated successfully");
      triggerRefresh();
      await fetchSigners();
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
    signers,
    isLoading,
    isSubmitting,
    fetchSigners,
    replaceSigner,
  };
};
