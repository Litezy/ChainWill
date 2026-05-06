// src/hooks/token/useERC20ReadCalls.ts
import { useCallback, useEffect, useState } from "react";
import { formatUnits } from "ethers";
import { useAccount } from "wagmi";

import { useCallReadMethods } from "@/hooks/contract/useCallReadMethods";
import { useTokenStore } from "@/stores/tokenStore";

// ── module-level decimals cache — persists across renders, no extra RPC calls
const decimalsCache = new Map<string, number>();

const CWT_DECIMALS = 18; // hardcode known token decimals to skip RPC call entirely

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

  const resolveDecimals = useCallback(async (): Promise<number | null> => {
    // 1. explicit prop wins
    if (decimals !== undefined) return decimals;
    // 2. module cache
    if (decimalsCache.has(tokenAddress)) return decimalsCache.get(tokenAddress)!;
    // 3. known CWT shortcut
    if (tokenAddress.toLowerCase() === tokenAddress.toLowerCase()) {
      decimalsCache.set(tokenAddress, CWT_DECIMALS);
      return CWT_DECIMALS;
    }
    // 4. fallback RPC call
    const result = await callReadFunction<number>("decimals", []);
    if (result === null) return null;
    const value = Number(result);
    decimalsCache.set(tokenAddress, value);
    return value;
  }, [decimals, tokenAddress, callReadFunction]);

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

      const tokenDecimals = await resolveDecimals();
      if (tokenDecimals === null) {
        setLocalBalance("0");
        setStoredBalance(tokenAddress, "0");
        return;
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
  }, [address, tokenAddress, callReadFunction, resolveDecimals, setStoredBalance]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, rawBalance, isLoading, refetch: fetchBalance };
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

  const resolveDecimals = useCallback(async (): Promise<number | null> => {
    if (decimals !== undefined) return decimals;
    if (decimalsCache.has(tokenAddress)) return decimalsCache.get(tokenAddress)!;
    const result = await callReadFunction<number>("decimals", []);
    if (result === null) return null;
    const value = Number(result);
    decimalsCache.set(tokenAddress, value);
    return value;
  }, [decimals, tokenAddress, callReadFunction]);

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

      const tokenDecimals = await resolveDecimals();
      if (tokenDecimals === null) {
        setLocalAllowance("0");
        setStoredAllowance(tokenAddress, spenderAddress, "0");
        return;
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
  }, [address, tokenAddress, spenderAddress, callReadFunction, resolveDecimals, setStoredAllowance]);

  useEffect(() => {
    fetchAllowance();
  }, [fetchAllowance]);

  return { allowance, rawAllowance, isLoading, refetch: fetchAllowance };
};