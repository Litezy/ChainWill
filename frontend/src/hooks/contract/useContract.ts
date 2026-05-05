import { useMemo } from "react";
import { Contract, getAddress } from "ethers";
import FACTORY_ABI from "@/ABI/factoryAbi";
import chainWillAbi from "@/ABI/chainWIllAbi";
import useRunners from "@/config/useRunner";
import { FACTORY_CONTRACT_ADDRESS, CHAINWILL_TOKEN_CONTRACT_ADDRESS } from "@/constants/contract";
import { TOKEN_ABI } from "@/ABI/tokenAbi";
import { useContractStore } from "@/stores/contractStore";

type ContractType = "factory" | "child" | "erc20";

type UseContractProps = {
  type: ContractType;
  withSigner?: boolean;
  address?: string;
};

export const useContract = ({
  type = "child",
  withSigner = false,
  address,
}: UseContractProps) => {
  const { readOnlyProvider, signer } = useRunners();
  const storedAddress = useContractStore((s) => s.contractAddress);

  return useMemo(() => {
    const contractAddress =
      type === "factory"
        ? FACTORY_CONTRACT_ADDRESS
        : type === "child"
        ? address ?? storedAddress ?? ""   // prop → store → empty
        : address ?? CHAINWILL_TOKEN_CONTRACT_ADDRESS;

    const abi =
      type === "factory"
        ? FACTORY_ABI
        : type === "child"
        ? chainWillAbi
        : TOKEN_ABI;

    if (withSigner && !signer) return null;

    // no address available yet — don't attempt to instantiate
    if (!contractAddress) return null;

    try {
      return new Contract(
        getAddress(contractAddress),
        abi,
        withSigner ? signer : readOnlyProvider
      );
    } catch (err) {
      console.error("Invalid contract:", err);
      return null;
    }
  }, [type, address, storedAddress, withSigner, signer, readOnlyProvider]);
};