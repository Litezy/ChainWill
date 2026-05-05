import { create } from "zustand"
import { persist } from "zustand/middleware"

type WalletState = {
  address?: `0x${string}`
  isConnected: boolean
  chainId?: number

  refreshKey: number // used to retrigger hooks

  setWallet: (data: {
    address?: `0x${string}`
    isConnected: boolean
    chainId?: number
  }) => void

  triggerRefresh: () => void
  reset: () => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: undefined,
      isConnected: false,
      chainId: undefined,
      refreshKey: 0,

      setWallet: (data) => set(data),

      triggerRefresh: () =>
        set((state) => ({ refreshKey: state.refreshKey + 1 })),

      reset: () =>
        set({
          address: undefined,
          isConnected: false,
          chainId: undefined,
          refreshKey: 0,
        }),
    }),
    {
      name: "wallet-storage",
    }
  )
)