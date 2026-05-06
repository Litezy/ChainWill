import { useCallback } from "react";
import { handleContractError } from "@/error/handleError";
import { errorMessage } from "@/utils/messageStatus";
import { useCallContract } from "./useContractCall";

export const useCallReadMethods = (
  type: "factory" | "child" | "erc20",
  childAddress?: string,
) => {
  const { assertContract, readContract } = useCallContract(type, childAddress);

  const callReadFunction = useCallback(async <T = unknown>(
    method: string,
    args: unknown[],
  ): Promise<T | null> => {
    if (!assertContract()) return null;
    if (!readContract) {
      errorMessage("Contract not found");
      return null;
    }

    try {
      const contractMethod =
        (readContract as any)[method] ??
        (readContract as any).functions?.[method];

      if (typeof contractMethod !== "function") {
        throw new Error(`Contract method '${method}' is not available`);
      }

      const data = await contractMethod(...args);
      return data as T;
    } catch (error: unknown) {
      handleContractError(error);
      return null;
    }
  }, [assertContract, readContract]);

  return { callReadFunction };
};