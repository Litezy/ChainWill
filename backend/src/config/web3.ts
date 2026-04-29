import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

export const viemClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.RPC_URL),
});