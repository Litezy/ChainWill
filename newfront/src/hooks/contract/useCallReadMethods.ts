import { handleContractError } from "@/error/handleError";
import { errorMessage } from "@/utils/messageStatus";
import { useCallContract } from "./useContractCall";


export const useCallReadMethods = (type:"factory" | "child", childAddress?: string) => {
    const { assertContract, readContract } = useCallContract(type, childAddress)

    const callReadFunction = async (method: string, args: any[]): Promise<any | null> => {
        if (!assertContract()) return null;
        if (!readContract) {
            errorMessage("Contract not found")
            return null;
        }
        try {
            const data = await readContract[method](...args);
            return data;
        } catch (error: any) {
           handleContractError(error);
            return null;
        }
    };

    return { callReadFunction };
};
