import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WillStatusState = {
  approvedAmount: string;
  ownerWalletBalance: string;
  effectivePullAmount: string;
  timeRemaining: number;
  attestationOpensAt: number;
  triggerUnlocksAt: number;
  triggered: boolean;
  locked: boolean;
  finalPool: string;
  lastUpdatedAt: number | null;
  isLoading: boolean;
  error: string | null;
  refreshKey: number;
  setWillStatus: (data: {
    approvedAmount: string;
    ownerWalletBalance: string;
    effectivePullAmount: string;
    timeRemaining: number;
    attestationOpensAt: number;
    triggerUnlocksAt: number;
    triggered: boolean;
    locked: boolean;
    finalPool: string;
  }) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  triggerRefresh: () => void;
  reset: () => void;
};

const initialState = {
  approvedAmount: "0",
  ownerWalletBalance: "0",
  effectivePullAmount: "0",
  timeRemaining: 0,
  attestationOpensAt: 0,
  triggerUnlocksAt: 0,
  triggered: false,
  locked: false,
  finalPool: "0",
  lastUpdatedAt: null,
  isLoading: false,
  error: null,
  refreshKey: 0,
};

export const useWillStatusStore = create<WillStatusState>()(
  persist(
    (set) => ({
      ...initialState,
      setWillStatus: (data) =>
        set({
          ...data,
          lastUpdatedAt: Date.now(),
          error: null,
        }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      triggerRefresh: () =>
        set((state) => ({ refreshKey: state.refreshKey + 1 })),
      reset: () => set(initialState),
    }),
    {
      name: "will-status-storage",
      partialize: (state) => ({
        approvedAmount: state.approvedAmount,
        ownerWalletBalance: state.ownerWalletBalance,
        effectivePullAmount: state.effectivePullAmount,
        timeRemaining: state.timeRemaining,
        attestationOpensAt: state.attestationOpensAt,
        triggerUnlocksAt: state.triggerUnlocksAt,
        triggered: state.triggered,
        locked: state.locked,
        finalPool: state.finalPool,
        lastUpdatedAt: state.lastUpdatedAt,
      }),
    }
  )
);
