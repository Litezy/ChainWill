import { create } from "zustand"
import { persist } from "zustand/middleware"

type BalanceState = {
  nativeBalance: string
  tokenBalances: Record<string, string>

  refreshKey: number

  setNativeBalance: (balance: string) => void
  setTokenBalance: (token: string, balance: string) => void

  triggerRefresh: () => void
  reset: () => void
}

export const useBalanceStore = create<BalanceState>()(
  persist(
    (set) => ({
      nativeBalance: "0",
      tokenBalances: {},
      refreshKey: 0,

      setNativeBalance: (balance) =>
        set({ nativeBalance: balance }),

      setTokenBalance: (token, balance) =>
        set((state) => ({
          tokenBalances: {
            ...state.tokenBalances,
            [token]: balance,
          },
        })),

      triggerRefresh: () =>
        set((state) => ({ refreshKey: state.refreshKey + 1 })),

      reset: () =>
        set({
          nativeBalance: "0",
          tokenBalances: {},
          refreshKey: 0,
        }),
    }),
    {
      name: "balance-storage",
    }
  )
)