import { useContractCaller } from '@/config/contracts'
import {
  useReadContract,
  useAccount,
} from 'wagmi'


// ── READ: get all wills by owner ──────────────────────────────────────
export function useOwnerWills() {
  const {factoryContractConfig} = useContractCaller()
  const { address } = useAccount()

  return useReadContract({
    ...factoryContractConfig,
    functionName: 'getWillsByOwner',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })
}

// ── READ: total wills deployed ────────────────────────────────────────
export function useTotalWills() {
   const {factoryContractConfig} = useContractCaller()
  return useReadContract({
    ...factoryContractConfig,
    functionName: 'totalWills',
  })
}


