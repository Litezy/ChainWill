import { create } from "zustand"
import { persist } from "zustand/middleware"

type TokenState = {
  // tokenAddress → balance
  balances: Record<string, string>

  // tokenAddress → spender → allowance
  allowances: Record<string, Record<string, string>>

  refreshKey: number

  // ── BALANCE ──
  setBalance: (token: string, balance: string) => void
  setBalances: (data: Record<string, string>) => void

  // ── ALLOWANCE ──
  setAllowance: (token: string, spender: string, amount: string) => void

  // ── HELPERS ──
  getBalance: (token: string) => string
  getAllowance: (token: string, spender: string) => string

  // ── CONTROL ──
  triggerRefresh: () => void
  reset: () => void
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set, get) => ({
      balances: {},
      allowances: {},
      refreshKey: 0,

      // ── BALANCE ──
      setBalance: (token, balance) =>
        set((state) => ({
          balances: {
            ...state.balances,
            [token.toLowerCase()]: balance,
          },
        })),

      setBalances: (data) =>
        set((state) => ({
          balances: {
            ...state.balances,
            ...Object.fromEntries(
              Object.entries(data).map(([k, v]) => [k.toLowerCase(), v])
            ),
          },
        })),

      // ── ALLOWANCE ──
      setAllowance: (token, spender, amount) =>
        set((state) => {
          const t = token.toLowerCase()
          const s = spender.toLowerCase()

          return {
            allowances: {
              ...state.allowances,
              [t]: {
                ...(state.allowances[t] || {}),
                [s]: amount,
              },
            },
          }
        }),

      // ── GETTERS ──
      getBalance: (token) =>
        get().balances[token.toLowerCase()] || "0",

      getAllowance: (token, spender) =>
        get().allowances[token.toLowerCase()]?.[spender.toLowerCase()] || "0",

      // ── CONTROL ──
      triggerRefresh: () =>
        set((state) => ({ refreshKey: state.refreshKey + 1 })),

      reset: () =>
        set({
          balances: {},
          allowances: {},
          refreshKey: 0,
        }),
    }),
    {
      name: "token-storage",

      partialize: (state) => ({
        balances: state.balances,
        allowances: state.allowances,
      }),
    }
  )
)