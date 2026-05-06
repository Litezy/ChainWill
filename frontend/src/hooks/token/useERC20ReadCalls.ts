import { useCallback, useEffect, useState } from "react";
import { formatUnits } from "ethers";
import { useAccount } from "wagmi";

import { useCallReadMethods } from "@/hooks/contract/useCallReadMethods";
import { useTokenStore } from "@/stores/tokenStore";

type UseTokenBalanceProps = {
  tokenAddress: string;
  decimals?: number;
};

export const useTokenBalance = ({ tokenAddress, decimals }: UseTokenBalanceProps) => {
  const { address } = useAccount();
  const { callReadFunction } = useCallReadMethods("erc20", tokenAddress);
  const setStoredBalance = useTokenStore((state) => state.setBalance);

  const [balance, setLocalBalance] = useState<string>("0");
  const [rawBalance, setRawBalance] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!address || !tokenAddress) return;

    try {
      setIsLoading(true);

      const result = await callReadFunction<bigint>("balanceOf", [address]);
      if (result === null) {
        setRawBalance(0n);
        setLocalBalance("0");
        setStoredBalance(tokenAddress, "0");
        return;
      }

      setRawBalance(result);

      let tokenDecimals = decimals;
      if (tokenDecimals === undefined) {
        const decimalsResult = await callReadFunction<number>("decimals", []);
        if (decimalsResult === null) {
          setLocalBalance("0");
          setStoredBalance(tokenAddress, "0");
          return;
        }
        tokenDecimals = Number(decimalsResult);
      }

      const formatted = formatUnits(result, tokenDecimals);
      setLocalBalance(formatted);
      setStoredBalance(tokenAddress, formatted);
    } catch (err) {
      console.error("Balance fetch error:", err);
      setRawBalance(0n);
      setLocalBalance("0");
      setStoredBalance(tokenAddress, "0");
    } finally {
      setIsLoading(false);
    }
  }, [address, tokenAddress, decimals, callReadFunction, setStoredBalance]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    rawBalance,
    isLoading,
    refetch: fetchBalance,
  };
};

// ─────────────────────────────────────────────────────────────────────────────

type UseTokenAllowanceProps = {
  tokenAddress: string;
  spenderAddress: string;
  decimals?: number;
};

export const useTokenAllowance = ({
  tokenAddress,
  spenderAddress,
  decimals,
}: UseTokenAllowanceProps) => {
  const { address } = useAccount();
  const { callReadFunction } = useCallReadMethods("erc20", tokenAddress);
  const setStoredAllowance = useTokenStore((state) => state.setAllowance);

  const [allowance, setLocalAllowance] = useState<string>("0");
  const [rawAllowance, setRawAllowance] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllowance = useCallback(async () => {
    if (!address || !tokenAddress || !spenderAddress) return;

    try {
      setIsLoading(true);

      const result = await callReadFunction<bigint>("allowance", [address, spenderAddress]);
      if (result === null) {
        setRawAllowance(0n);
        setLocalAllowance("0");
        setStoredAllowance(tokenAddress, spenderAddress, "0");
        return;
      }

      setRawAllowance(result);

      let tokenDecimals = decimals;
      if (tokenDecimals === undefined) {
        const decimalsResult = await callReadFunction<number>("decimals", []);
        if (decimalsResult === null) {
          setLocalAllowance("0");
          setStoredAllowance(tokenAddress, spenderAddress, "0");
          return;
        }
        tokenDecimals = Number(decimalsResult);
      }

      const formatted = formatUnits(result, tokenDecimals);
      setLocalAllowance(formatted);
      setStoredAllowance(tokenAddress, spenderAddress, formatted);
    } catch (err) {
      console.error("Allowance fetch error:", err);
      setRawAllowance(0n);
      setLocalAllowance("0");
      setStoredAllowance(tokenAddress, spenderAddress, "0");
    } finally {
      setIsLoading(false);
    }
  }, [address, tokenAddress, spenderAddress, decimals, callReadFunction, setStoredAllowance]);

  useEffect(() => {
    fetchAllowance();
  }, [fetchAllowance]);

  return {
    allowance,
    rawAllowance,
    isLoading,
    refetch: fetchAllowance,
  };
};