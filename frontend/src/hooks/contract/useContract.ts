import { useMemo } from "react";
import { Contract, getAddress } from "ethers";
import FACTORY_ABI from "@/ABI/factoryAbi";
import chainWillAbi from "@/ABI/chainWIllAbi";
import useRunners from "@/config/useRunner";
import { CHAINWILL_CONTRACT, FACTORY_CONTRACT_ADDRESS } from "@/constants/contract";

type ContractType = "factory" | "child";

type UseContractProps = {
  type: ContractType;
  withSigner?: boolean;
  address?: string; // only needed for child
};

export const useContract = ({
  type = "child",
  withSigner = false,
  address,
}: UseContractProps) => {
  const { readOnlyProvider, signer } = useRunners();

  return useMemo(() => {
    const contractAddress = type === "factory" ? FACTORY_CONTRACT_ADDRESS : address ?? CHAINWILL_CONTRACT;
    const abi = type === "factory" ? FACTORY_ABI : chainWillAbi;

    if (withSigner && !signer) return null;

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
  }, [type, address, withSigner, signer, readOnlyProvider]);
};
