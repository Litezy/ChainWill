import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { FACTORY_CONTRACT_ADDRESS, FACTORY_ABI } from '@/constants/contract';

/**
 * Hook to check if a user owns any wills
 * Returns boolean indicating ownership status
 */
export function useWillOwner(address: string | undefined) {
  const [ownsWill, setOwnsWill] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!address || !publicClient) {
      setIsLoading(false);
      setOwnsWill(false);
      return;
    }

    const checkWillOwnership = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const wills = await publicClient.readContract({
          address: FACTORY_CONTRACT_ADDRESS,
          abi: FACTORY_ABI,
          functionName: 'getWillsByOwner',
          args: [address as `0x${string}`],
        });

        setOwnsWill(Array.isArray(wills) && wills.length > 0);
      } catch (err) {
        console.error('Error checking will ownership:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setOwnsWill(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkWillOwnership();
  }, [address, publicClient]);

  return { ownsWill, isLoading, error };
}
