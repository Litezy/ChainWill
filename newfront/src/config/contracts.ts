import { Contract } from "ethers";
import chainWillAbi from "@/ABI/chainWIllAbi"
import FACTORY_ABI from "@/ABI/factoryAbi"
import { CHAINWILL_CONTRACT, FACTORY_CONTRACT_ADDRESS } from "@/constants/contract";

export const factoryContractConfig = {
  address: FACTORY_CONTRACT_ADDRESS,
  abi: FACTORY_ABI,
} as const;

export const FactoryContract =(signerOrProvider: any)=> new Contract(
  FACTORY_CONTRACT_ADDRESS,
  FACTORY_ABI,
  signerOrProvider,
);

export const ChainWillContract =(signerOrProvider: any)=> new Contract(
  CHAINWILL_CONTRACT,
  chainWillAbi,
  signerOrProvider,
);
