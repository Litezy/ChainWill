import { useMemo, useState } from "react";
import { parseUnits } from "ethers";
import { useAccount } from "wagmi";

import { CHAINWILL_CONTRACT, CHAINWILL_TOKEN_CONTRACT_ADDRESS } from "@/constants/contract";
import { useCallReadMethods } from "@/hooks/contract/useCallReadMethods";
import { useCallWriteMethods } from "@/hooks/contract/useCallWriteMethods";
import { useGasEstimator } from "@/hooks/contract/useGasEstimator";
import { useTokenAllowance } from "@/hooks/token/useERC20ReadCalls";
import { useTokenStore } from "@/stores/tokenStore";
import { useTokenApprovalStore } from "@/stores/tokenApprovalStore";
import { useWillStatusStore } from "@/stores/willStatusStore";
import {
  dismissToast,
  errorMessage,
  loadingMessage,
  successMessage,
} from "@/utils/messageStatus";

export default function TokenApprovalCard() {
  const { address } = useAccount();
  const { callReadFunction } = useCallReadMethods("erc20", CHAINWILL_TOKEN_CONTRACT_ADDRESS);
  const { callWriteFunction } = useCallWriteMethods("erc20", CHAINWILL_TOKEN_CONTRACT_ADDRESS);
  const { estimateGas } = useGasEstimator("erc20", CHAINWILL_TOKEN_CONTRACT_ADDRESS);
  const setStoredAllowance = useTokenStore((state) => state.setAllowance);
  const setApprovedToken = useTokenApprovalStore((state) => state.setApprovedToken);
  const addApprovalHistory = useTokenApprovalStore((state) => state.addApprovalHistory);
  const triggerWillStatusRefresh = useWillStatusStore((state) => state.triggerRefresh);
  const [approvalAmount, setApprovalAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useTokenAllowance({
    tokenAddress: CHAINWILL_TOKEN_CONTRACT_ADDRESS,
    spenderAddress: CHAINWILL_CONTRACT,
  });

  const selectedTokenLabel = useMemo(() => "CWT (ChainWill Token)", []);

  const handleApprove = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!address) {
      errorMessage("Please connect wallet");
      return;
    }

    if (!approvalAmount.trim()) {
      errorMessage("Enter an approval amount");
      return;
    }

    const normalizedAmount = approvalAmount.trim();
    const numericAmount = Number(normalizedAmount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      errorMessage("Approval amount must be greater than zero");
      return;
    }

    setIsSubmitting(true);
    const toastId = loadingMessage("Submitting token approval...");

    try {
      const decimalsResult = await callReadFunction("decimals", []);
      if (decimalsResult === null) {
        throw new Error("Unable to read token decimals");
      }

      const parsedAmount = parseUnits(normalizedAmount, Number(decimalsResult));
      const gas = await estimateGas("approve", [CHAINWILL_CONTRACT, parsedAmount]);

      if (!gas) {
        return;
      }

      const isApproved = await callWriteFunction("approve", [CHAINWILL_CONTRACT, parsedAmount], gas);

      if (!isApproved) {
        return;
      }

      setStoredAllowance(
        CHAINWILL_TOKEN_CONTRACT_ADDRESS,
        CHAINWILL_CONTRACT,
        normalizedAmount
      );
      setApprovedToken(
        CHAINWILL_TOKEN_CONTRACT_ADDRESS,
        "CWT",
        normalizedAmount,
        CHAINWILL_CONTRACT
      );
      addApprovalHistory({
        id: `${Date.now()}`,
        event: "Approval update",
        asset: "CWT",
        tokenAddress: CHAINWILL_TOKEN_CONTRACT_ADDRESS,
        spender: CHAINWILL_CONTRACT,
        amount: normalizedAmount,
        status: "success",
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        timestamp: Date.now(),
      });
      triggerWillStatusRefresh();
      setApprovalAmount("");
      successMessage("CWT approval updated successfully");
    } catch (error) {
      console.error("Approval failed:", error);
      if (error instanceof Error) {
        errorMessage(error.message);
      }
    } finally {
      dismissToast(toastId);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">Token approval</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">Approve asset control</p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleApprove}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Token selection</label>
          <select
            value="CWT"
            disabled
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option>{selectedTokenLabel}</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Approval amount</label>
          <div className="relative">
            <input
              type="text"
              value={approvalAmount}
              onChange={(e) => setApprovalAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 pr-24 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">CWT</span>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">
          ChainWill Protocol Assurance: These tokens remain in your wallet and under your control until the smart contract trigger conditions are met.
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Approving..." : "Approve"}
        </button>
      </form>
    </div>
  );
}
