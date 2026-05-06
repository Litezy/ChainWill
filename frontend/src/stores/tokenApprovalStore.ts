import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ApprovalHistoryItem = {
  id: string;
  event: string;
  asset: string;
  tokenAddress: string;
  spender: string;
  contractAddress: string;
  willAddress: string;
  ownerAddress: string;
  amount: string;
  status: "success" | "revoked";
  date: string;
  timestamp: number;
};

type ApprovedTokenState = {
  approvedTokens: Record<
    string,
    {
      asset: string;
      amount: string;
      spender: string;
      contractAddress: string;
      willAddress: string;
      ownerAddress: string;
    }
  >;
  history: ApprovalHistoryItem[];
  setApprovedToken: (
    contractAddress: string,
    tokenAddress: string,
    asset: string,
    amount: string,
    spender: string,
    ownerAddress: string,
    willAddress: string
  ) => void;
  addApprovalHistory: (item: ApprovalHistoryItem) => void;
  clearApprovalHistory: () => void;
};

const getApprovalKey = (
  contractAddress: string,
  tokenAddress: string,
  spender: string,
  ownerAddress: string
) =>
  `${contractAddress.toLowerCase()}:${tokenAddress.toLowerCase()}:${spender.toLowerCase()}:${ownerAddress.toLowerCase()}`;

export const useTokenApprovalStore = create<ApprovedTokenState>()(
  persist(
    (set) => ({
      approvedTokens: {},
      history: [],

      setApprovedToken: (contractAddress, tokenAddress, asset, amount, spender, ownerAddress, willAddress) =>
        set((state) => ({
          approvedTokens: {
            ...state.approvedTokens,
            [getApprovalKey(contractAddress, tokenAddress, spender, ownerAddress)]: {
              asset,
              amount,
              spender,
              contractAddress,
              willAddress,
              ownerAddress,
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
