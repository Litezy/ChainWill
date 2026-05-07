import { Contract } from "ethers";
import {chainWillAbi} from "@/ABI/chainWillAbi"
import {FACTORY_ABI} from "@/ABI/factoryAbi"
import { FACTORY_CONTRACT_ADDRESS } from "@/constants/contract";
import { useContractStore } from "@/stores/contractStore";
// import type { Abi } from "viem"

export const useContractCaller = () => {
  const storedAddress = useContractStore((s) => s.contractAddress);
  const factoryContractConfig = {
    address: FACTORY_CONTRACT_ADDRESS,
    abi: FACTORY_ABI ,
  } as const;

  const FactoryContract = (signerOrProvider: any) => new Contract(
    FACTORY_CONTRACT_ADDRESS,
    FACTORY_ABI,
    signerOrProvider,
  );

  const ChainWillContract = (signerOrProvider: any) => new Contract(
    storedAddress!,
    chainWillAbi,
    signerOrProvider,
  );

  return {
    factoryContractConfig, FactoryContract, ChainWillContract
  }
}
