import { useAccount, useChainId} from "wagmi";
import { sepolia } from "wagmi/chains";
import { useWalletClient } from "wagmi";
import toast from "react-hot-toast";

export const useAssertChain = () => {
  const { isConnected, status } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();

  const isReady = status !== "connecting" && status !== "reconnecting";

  const assertChain = (): boolean => {
    if (!isReady) return false;

    if (!isConnected) {
      toast.error("Please connect wallet");
      return false;
    }

    if (chainId !== sepolia.id) {
      toast.error("Switch to Sepolia chain");
      return false;
    }

    if (!walletClient) {
      toast.error("No wallet detected");
      return false;
    }

    return true;
  };

  return { assertChain, isReady, isConnected };
};