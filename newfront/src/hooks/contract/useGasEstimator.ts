import { handleContractError } from "@/error/handleError";
import { useCallContract } from "./useContractCall";

export const useGasEstimator = (
  type: "factory" | "child",
  childAddress?: string
) => {
  const { writeContract, assertContract } = useCallContract(type, childAddress)

  const estimateGas = async (
    method: string,
    args: any[]
  ): Promise<bigint | null> => {

    if (!assertContract(true)) return null

    try {
      // simulate first (good practice)
      await writeContract![method].staticCall(...args)

      const estimatedGas = await writeContract![method].estimateGas(...args)

      // add 20% buffer
      const estimatedGasPlusBuffer = (120n * estimatedGas) / 100n

      return estimatedGasPlusBuffer

    } catch (error: any) {
    handleContractError(error)
      return null
    }
  }

  return { estimateGas }
}