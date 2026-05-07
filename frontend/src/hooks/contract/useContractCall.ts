import { useCallback } from "react"
import { errorMessage } from "@/utils/messageStatus"
import { useContract } from "./useContract"

export const useCallContract = (
  type: "factory" | "child" | "erc20",
  childAddress?: string
) => {
  const readContract = useContract({
    type,
    withSigner: false,
    address: childAddress,
  })

  const writeContract = useContract({
    type,
    withSigner: true,
    address: childAddress, 
  })

  const assertContract = useCallback(
    (needsSigner = false): boolean => {
      if (needsSigner && !writeContract) {
        errorMessage("Wallet not connected")
        return false
      }
      if (!readContract) {
        errorMessage("Contract not found")
        return false
      }
      return true
    },
    [readContract, writeContract]
  )

  return {
    readContract,
    writeContract,
    assertContract,
  }
}
