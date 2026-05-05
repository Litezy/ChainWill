import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ApprovalHistoryItem = {
  id: string;
  event: string;
  asset: string;
  tokenAddress: string;
  spender: string;
  amount: string;
  status: "success" | "revoked";
  date: string;
  timestamp: number;
};

type ApprovedTokenState = {
  approvedTokens: Record<string, { asset: string; amount: string; spender: string }>;
  history: ApprovalHistoryItem[];
  setApprovedToken: (
    tokenAddress: string,
    asset: string,
    amount: string,
    spender: string
  ) => void;
  addApprovalHistory: (item: ApprovalHistoryItem) => void;
  clearApprovalHistory: () => void;
};

const getApprovalKey = (tokenAddress: string, spender: string) =>
  `${tokenAddress.toLowerCase()}:${spender.toLowerCase()}`;

export const useTokenApprovalStore = create<ApprovedTokenState>()(
  persist(
    (set) => ({
      approvedTokens: {},
      history: [],

      setApprovedToken: (tokenAddress, asset, amount, spender) =>
        set((state) => ({
          approvedTokens: {
            ...state.approvedTokens,
            [getApprovalKey(tokenAddress, spender)]: {
              asset,
              amount,
              spender,
            },
          },
        })),

      addApprovalHistory: (item) =>
        set((state) => ({
          history: [item, ...state.history].slice(0, 20),
        })),

      clearApprovalHistory: () =>
        set({
          history: [],
        }),
    }),
    {
      name: "token-approval-storage",
      partialize: (state) => ({
        approvedTokens: state.approvedTokens,
        history: state.history,
      }),
    }
  )
);
