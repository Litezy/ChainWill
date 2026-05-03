import { useAssertChain } from "./useAssertChain";
import { errorMessage } from "@/utils/messageStatus";
import { useCallContract } from "./useContractCall";
import { handleContractError } from "@/error/handleError";

export const useCallWriteMethods = (childAddress?: string) => {
    const { writeContract, assertContract } = useCallContract("child", childAddress)
    const { assertChain } = useAssertChain()
    const callWriteFunction = async (method: string, args: any[], gas: bigint): Promise<boolean> => {
        if (!assertChain()) return false;
        if (!assertContract(true)) return false;

        if (!writeContract) {
            errorMessage("Contract not found")
            return false
        }
        try {
            const tx = await writeContract[method](...args, {
                gasLimit: gas,
            });
            const receipt = await tx.wait();
            if (receipt.status === 1) return true;
            return false;
        } catch (error: any) {
            handleContractError(error)
            return false;
        }
    };

    return { callWriteFunction };
};
