import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi'
import { decodeEventLog } from 'viem'
import {
  FACTORY_CONTRACT_ADDRESS,
} from '../constants/contract'
import FACTORY_ABI from '../ABI/factoryAbi'

// ── READ: get all wills by owner ──────────────────────────────────────
export function useOwnerWills() {
  const { address } = useAccount()

  return useReadContract({
    address: FACTORY_CONTRACT_ADDRESS,
    abi: FACTORY_ABI,
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
    address: FACTORY_CONTRACT_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'totalWills',
  })
}

// ── WRITE: create will ────────────────────────────────────────────────
export function useCreateWill() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  })

  // ── extract deployed will address from logs ─────────────────────────
  let deployedWillAddress: string | undefined

  if (receipt?.logs) {
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: FACTORY_ABI,
          data: log.data,
          topics: log.topics,
        })

        if (decoded.eventName === 'WillCreated') {
          deployedWillAddress = (decoded.args as any).will
        }
      } catch {
        // ignore non-matching logs
      }
    }
  }

  // ── create will function ────────────────────────────────────────────
  const createWill = (signers: `0x${string}`[]) => {
    writeContract({
      address: FACTORY_CONTRACT_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createWill',
      args: [signers],
    })
  }

  return {
    createWill,
    isPending,
    isConfirming,
    isSuccess,
    deployedWillAddress,
    hash,
    error,
  }
}