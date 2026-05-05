import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useCallWriteMethods } from "@/hooks/contract/useCallWriteMethods";
import { useGasEstimator } from "@/hooks/contract/useGasEstimator";
import { useContractStore } from "@/stores/contractStore";
import {
  errorMessage,
  loadingMessage,
  dismissToast,
  successMessage,
} from "@/utils/messageStatus";
import { useContractCaller } from "@/config/contracts";

type Signer = {
  name: string;
  address: string;
  email: string;
};

type CreateWillPayload = {
  ownerName: string;
  ownerEmail: string;
  signers: Signer[];
};

export const useCreateWill = () => {
  const { callWriteFunction } = useCallWriteMethods("factory");
  const { estimateGas } = useGasEstimator("factory");
  const { address: ownerAddress } = useAccount();
  const {factoryContractConfig} = useContractCaller()
  const setContractAddress = useContractStore((s) => s.setContractAddress);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── check if owner already has a will ──────────────────────────────
  const { data: existingWills, isLoading: isCheckingWills } = useReadContract({
    ...factoryContractConfig,
    functionName: "getWillsByOwner",
    args: ownerAddress ? [ownerAddress] : undefined,
    query: { enabled: !!ownerAddress },
  });

  const createWill = async (payload: CreateWillPayload): Promise<boolean> => {
    const { signers } = payload;

    if (!ownerAddress) {
      errorMessage("Wallet not connected");
      return false;
    }

    // ── 1. check for existing will ──────────────────────────────────
    const wills = existingWills as string[] | undefined;
    if (wills && wills.length > 0) {
      errorMessage("You already have a will deployed. Only one will is allowed per owner.");
      return false;
    }

    const signerAddresses = signers.map((s) => s.address);
    const toastId = loadingMessage("Estimating gas...");
    setIsSubmitting(true);

    try {
      // ── 2. estimate gas ─────────────────────────────────────────────
      const gas = await estimateGas("createWill", [signerAddresses]);
      if (!gas) return false;

      // ── 3. send tx ──────────────────────────────────────────────────
      loadingMessage("Creating will on-chain...");

      const { success, receipt } = await callWriteFunction(
        "createWill",
        [signerAddresses],
        gas
      );

      if (!success || !receipt) return false;

      // ── 4. extract deployed will address from receipt logs ──────────
      let contractAddress: string | undefined;

      for (const log of receipt.logs ?? []) {
        try {
          if (log.topics && log.topics.length >= 3) {
            contractAddress = "0x" + log.topics[2].slice(26);
            break;
          }
          if (log.data && log.data !== "0x") {
            contractAddress = "0x" + log.data.slice(26, 66);
            break;
          }
        } catch {
          continue;
        }
      }

      if (!contractAddress) {
        errorMessage("Could not extract will address from transaction");
        return false;
      }

      // ── 5. feed address into global store ──────────────────────────
      setContractAddress(contractAddress);

      successMessage("Will created successfully");
      return true;
    } catch (error: any) {
      errorMessage(error?.message ?? "Something went wrong");
      return false;
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  return { createWill, isSubmitting, isCheckingWills };
};

 // ── 4. send to backend ──────────────────────────────────────────
      // loadingMessage("Saving will details...");

      // const response = await fetch("/api/wills", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     contractAddress,
      //     ownerAddress,
      //     ownerName,
      //     ownerEmail,
      //     tokenAddress,
      //     inactivityPeriod,
      //     gracePeriod: gracePeriod ?? 604800,
      //     createdTxHash: receipt.hash ?? createdTxHash,
      //     signers,
      //   }),
      // });

      // if (!response.ok) {
      //   const err = await response.json().catch(() => ({}));
      //   errorMessage(err?.message ?? "Failed to save will to database");
      //   return false;
      // }