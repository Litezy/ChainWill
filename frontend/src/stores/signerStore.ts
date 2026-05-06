import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SignerRecord = {
  id: number;
  wallet: string;
  signed: boolean;
  signedAt: number;
  name: string;
  email: string;
};

type SignerStore = {
  signers: SignerRecord[];
  isLoading: boolean;
  error: string | null;
  setSigners: (signers: SignerRecord[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  upsertSigner: (signer: SignerRecord) => void;
  reset: () => void;
};

const initialState = {
  signers: [],
  isLoading: false,
  error: null,
};

export const useSignerStore = create<SignerStore>()(
  persist(
    (set) => ({
      ...initialState,
      setSigners: (signers) => set({ signers }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      upsertSigner: (signer) =>
        set((state) => {
          const existingIndex = state.signers.findIndex(
            (item) => item.id === signer.id
          );

          if (existingIndex === -1) {
            return { signers: [...state.signers, signer] };
          }

          return {
            signers: state.signers.map((item) =>
              item.id === signer.id ? signer : item
            ),
          };
        }),
      reset: () => set(initialState),
    }),
    {
      name: "signer-storage",
      partialize: (state) => ({
        signers: state.signers,
      }),
    }
  )
);
