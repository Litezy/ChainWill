import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { decodeEventLog } from "viem";
import { factoryContractConfig } from "@/config/contracts";
import {
  errorMessage,
  loadingMessage,
  dismissToast,
  successMessage,
} from "@/utils/messageStatus";

type Signer = {
  name: string;
  address: string;
  email: string;
};

type CreateWillPayload = {
  ownerName: string;
  ownerEmail: string;
  token: string;
  signers: Signer[];
};

export const useCreateWill = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    writeContractAsync,
    error: writeError,
  } = useWriteContract();

  const createWill = async (payload: CreateWillPayload): Promise<boolean> => {
    const { ownerName, ownerEmail, token, signers } = payload;

    const signerAddresses = signers.map((s) => s.address as `0x${string}`);

    const toastId = loadingMessage("Creating will on-chain...");
    setIsSubmitting(true);

    try {
      // ── 1. send tx and wait for receipt in one shot ─────────────────
      const hash = await writeContractAsync({
        ...factoryContractConfig,
        functionName: "createWill",
        args: [signerAddresses],
      });

      loadingMessage("Waiting for confirmation...");

      // ── 2. poll for receipt manually since we need it synchronously ──
      const { createPublicClient, http } = await import("viem");
      const { sepolia } = await import("viem/chains");

      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status !== "success") {
        errorMessage("Transaction failed on-chain");
        return false;
      }

      // ── 3. decode logs to extract deployed will address ──────────────
      let deployedWillAddress: string | undefined;

      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: factoryContractConfig.abi,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === "WillCreated") {
            deployedWillAddress = (decoded.args as any).will;
            break;
          }
        } catch {
          // skip non-matching logs
        }
      }

      if (!deployedWillAddress) {
        errorMessage("Could not extract will address from transaction");
        return false;
      }

      // ── 4. send to backend ───────────────────────────────────────────
      loadingMessage("Saving will details...");

      const response = await fetch("/api/wills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName,
          ownerEmail,
          token,
          willAddress: deployedWillAddress,
          signers, // [{ name, address, email }]
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        errorMessage(err?.message ?? "Failed to save will to database");
        return false;
      }

      successMessage("Will created successfully");
      return true;
    } catch (error: any) {
      const msg =
        error?.shortMessage ??
        error?.message ??
        "Something went wrong";
      errorMessage(msg);
      return false;
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  return { createWill, isSubmitting };
};