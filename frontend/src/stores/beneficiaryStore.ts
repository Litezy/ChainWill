import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BeneficiaryRecord = {
  id: number;
  wallet: string;
  percentBps: number;
  claimed: boolean;
  claimedAt: number;
  name: string;
  email: string;
  role: string;
};

type BeneficiaryStore = {
  beneficiaries: BeneficiaryRecord[];
  remainingPercentBps: number;
  isLoading: boolean;
  error: string | null;
  setBeneficiaries: (beneficiaries: BeneficiaryRecord[]) => void;
  setRemainingPercentBps: (remainingPercentBps: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  upsertBeneficiary: (beneficiary: BeneficiaryRecord) => void;
  removeBeneficiary: (id: number) => void;
  reset: () => void;
};

const initialState = {
  beneficiaries: [],
  remainingPercentBps: 10_000,
  isLoading: false,
  error: null,
};

export const useBeneficiaryStore = create<BeneficiaryStore>()(
  persist(
    (set) => ({
      ...initialState,
      setBeneficiaries: (beneficiaries) => set({ beneficiaries }),
      setRemainingPercentBps: (remainingPercentBps) => set({ remainingPercentBps }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      upsertBeneficiary: (beneficiary) =>
        set((state) => {
          const existingIndex = state.beneficiaries.findIndex(
            (item) => item.id === beneficiary.id
          );

          if (existingIndex === -1) {
            return { beneficiaries: [...state.beneficiaries, beneficiary] };
          }

          return {
            beneficiaries: state.beneficiaries.map((item) =>
              item.id === beneficiary.id ? beneficiary : item
            ),
          };
        }),
      removeBeneficiary: (id) =>
        set((state) => ({
          beneficiaries: state.beneficiaries.filter((item) => item.id !== id),
        })),
      reset: () => set(initialState),
    }),
    {
      name: "beneficiary-storage",
      partialize: (state) => ({
        beneficiaries: state.beneficiaries,
        remainingPercentBps: state.remainingPercentBps,
      }),
    }
  )
);
