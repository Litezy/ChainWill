import { create } from "zustand"
import { persist } from "zustand/middleware"

type ContractStore = {
  // all user deployed contracts
  contracts: string[]

  // currently selected contract
  activeContract: string | null

  refreshKey: number

  // ── SETTERS ──
  setContracts: (contracts: string[]) => void
  addContract: (address: string) => void

  // ── ACTIVE ──
  setActiveContract: (address: string | null) => void

  // ── HELPERS ──
  hasContract: (address: string) => boolean

  // ── CONTROL ──
  triggerRefresh: () => void
  reset: () => void
}

export const useContractStore = create<ContractStore>()(
  persist(
    (set, get) => ({
      contracts: [],
      activeContract: null,
      refreshKey: 0,

      // ── SET ALL (from factory) ──
      setContracts: (contracts) =>
        set({
          contracts: contracts.map((c) => c.toLowerCase()),
        }),

      // ── ADD ONE (after deploy) ──
      addContract: (address) =>
        set((state) => {
          const addr = address.toLowerCase()

          // prevent duplicates
          if (state.contracts.includes(addr)) return state

          return {
            contracts: [...state.contracts, addr],
          }
        }),


      // ── ACTIVE CONTRACT ──
      setActiveContract: (address) =>
        set({
          activeContract: address ? address.toLowerCase() : null,
        }),

      // ── HELPERS ──
      hasContract: (address) =>
        get().contracts.includes(address.toLowerCase()),

      // ── CONTROL ──
      triggerRefresh: () =>
        set((state) => ({ refreshKey: state.refreshKey + 1 })),

      reset: () =>
        set({
          contracts: [],
          activeContract: null,
          refreshKey: 0,
        }),
    }),
    {
      name: "contract-storage",

      partialize: (state) => ({
        contracts: state.contracts,
        activeContract: state.activeContract,
      }),
    }
  )
)