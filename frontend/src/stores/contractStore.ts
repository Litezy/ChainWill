import { create } from "zustand"
import { persist } from "zustand/middleware"

type ContractStore = {
  contractAddress: string | null
  refreshKey: number

  setContractAddress: (address: string) => void
  triggerRefresh: () => void
  reset: () => void
}

export const useContractStore = create<ContractStore>()(
  persist(
    (set) => ({
      contractAddress: null,
      refreshKey: 0,

      setContractAddress: (address) =>
        set({ contractAddress: address.toLowerCase() }),

      triggerRefresh: () =>
        set((state) => ({ refreshKey: state.refreshKey + 1 })),

      reset: () =>
        set({ contractAddress: null, refreshKey: 0 }),
    }),
    {
      name: "contract-storage",
      partialize: (state) => ({
        contractAddress: state.contractAddress,
      }),
    }
  )
)