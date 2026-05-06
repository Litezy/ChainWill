// src/hooks/child/useWillOwner.ts
import { useCallback, useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { FACTORY_CONTRACT_ADDRESS } from "@/constants/contract";
import FACTORY_ABI from "@/ABI/factoryAbi";

export function useWillOwner(address: string | undefined) {
  const [ownsWill, setOwnsWill] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false); // ← false by default, avoids setState in effect
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();

  const checkWillOwnership = useCallback(async () => {
    if (!address || !publicClient) return; // ← just return, state already false

    try {
      setIsLoading(true);
      setError(null);

      const wills = await publicClient.readContract({
        address: FACTORY_CONTRACT_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "getWillsByOwner",
        args: [address as `0x${string}`],
      });

      setOwnsWill(Array.isArray(wills) && wills.length > 0);
    } catch (err) {
      console.error("Error checking will ownership:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setOwnsWill(false);
    } finally {
      setIsLoading(false);
    }
  }, [address, publicClient]);

  useEffect(() => {
    checkWillOwnership();
  }, [checkWillOwnership]);

  return { ownsWill, isLoading, error };
}