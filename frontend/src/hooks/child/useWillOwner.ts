// src/hooks/child/useWillOwner.ts
import { useCallback, useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
// import { FACTORY_CONTRACT_ADDRESS } from "@/constants/contract";
// import {FACTORY_ABI} from "@/ABI/factoryAbi";
import { useCallReadMethods } from "@/hooks/contract/useCallReadMethods";
import { useContractStore } from "@/stores/contractStore";

export function useWillOwner(address: string | undefined) {
  const { callReadFunction } = useCallReadMethods("factory");
  const {setContractAddress} = useContractStore()
  const [ownsWill, setOwnsWill] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false); // ← false by default, avoids setState in effect
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();

  const checkWillOwnership = useCallback(async () => {
    if (!address || !publicClient) return; // ← just return, state already false

    try {
      setIsLoading(true);
      setError(null);

      const wills = await callReadFunction("getWillsByOwner", [address]);
      if (wills && Array.isArray(wills) && wills.length > 0) {
        setContractAddress(wills[0]); // ← set the first will's address in the store
        setOwnsWill(true);
        return;
      }
      setOwnsWill(false);
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
