import { handleContractError } from "@/error/handleError";
import { errorMessage } from "@/utils/messageStatus";
import { useCallContract } from "./useContractCall";

export const useCallReadMethods = (
  type: "factory" | "child" | "erc20",
  childAddress?: string,
) => {
  const { assertContract, readContract } = useCallContract(type, childAddress);

  const callReadFunction = async <T = unknown>(
    method: string,
    args: unknown[],
  ): Promise<T | null> => {
    if (!assertContract()) return null;
    if (!readContract) {
      errorMessage("Contract not found");
      return null;
    }
    try {
      const data = await readContract[method](...args);
      return data as T;
    } catch (error: unknown) {
      handleContractError(error);
      return null;
    }
  };

  return { callReadFunction };
};