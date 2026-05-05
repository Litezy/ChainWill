import {
  useReadContract,
  useAccount,
} from 'wagmi'
import { factoryContractConfig } from '@/config/contracts'

// ── READ: get all wills by owner ──────────────────────────────────────
export function useOwnerWills() {
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
  return useReadContract({
    ...factoryContractConfig,
    functionName: 'totalWills',
  })
}


