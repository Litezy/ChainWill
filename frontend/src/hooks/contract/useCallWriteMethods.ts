import { useAssertChain } from "./useAssertChain";
import { errorMessage } from "@/utils/messageStatus";
import { useCallContract } from "./useContractCall";
import { handleContractError } from "@/error/handleError";

type WriteResult = { success: boolean; receipt: any | null };

export const useCallWriteMethods = (
  type: "factory" | "child" | "erc20" = "child",
  contractAddress?: string
) => {
  const { writeContract, assertContract } = useCallContract(type, contractAddress);
  const { assertChain } = useAssertChain();

  const callWriteFunction = async (
    method: string,
    args: any[],
    gas: bigint
  ): Promise<WriteResult> => {
    if (!assertChain()) return { success: false, receipt: null };
    if (!assertContract(true)) return { success: false, receipt: null };

    if (!writeContract) {
      errorMessage("Contract not found");
      return { success: false, receipt: null };
    }

    try {
      const tx = await writeContract[method](...args, { gasLimit: gas });
      const receipt = await tx.wait();

      if (receipt.status === 1) return { success: true, receipt };
      return { success: false, receipt: null };
    } catch (error: any) {
      handleContractError(error);
      return { success: false, receipt: null };
    }
  };

  return { callWriteFunction };
};