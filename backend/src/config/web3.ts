import {
  createPublicClient,
  createWalletClient,
  http,
  type Hex,
} from 'viem';
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts';
import dotenv from 'dotenv';

dotenv.config();

const rpcUrl = process.env.RPC_URL?.trim();
const normalizedAdminPrivateKey = normalizePrivateKey(
  process.env.ADMIN_PRIVATE_KEY
);

let adminAccount: PrivateKeyAccount | null = null;
let adminConfigurationError: string | null = null;

if (normalizedAdminPrivateKey) {
  try {
    adminAccount = privateKeyToAccount(normalizedAdminPrivateKey);
  } catch (error) {
    adminConfigurationError =
      error instanceof Error
        ? error.message
        : 'Unable to parse ADMIN_PRIVATE_KEY';
  }
}

export const viemClient = createPublicClient({
  transport: http(rpcUrl),
});

export const adminWalletClient = adminAccount
  ? createWalletClient({
      account: adminAccount,
      transport: http(rpcUrl),
    })
  : null;

export function getAdminRelayerStatus(): {
  configured: boolean;
  address: `0x${string}` | null;
  error: string | null;
} {
  return {
    configured: adminWalletClient !== null,
    address: adminAccount?.address ?? null,
    error: adminConfigurationError,
  };
}

export function assertAdminRelayerConfigured(): {
  account: PrivateKeyAccount;
  walletClient: NonNullable<typeof adminWalletClient>;
} {
  if (adminConfigurationError) {
    throw new Error(
      `Invalid ADMIN_PRIVATE_KEY configuration: ${adminConfigurationError}`
    );
  }

  if (!adminAccount || !adminWalletClient) {
    throw new Error(
      'ADMIN_PRIVATE_KEY is required for the mandatory admin relayer'
    );
  }

  return {
    account: adminAccount,
    walletClient: adminWalletClient,
  };
}

function normalizePrivateKey(rawValue?: string): Hex | null {
  if (!rawValue) {
    return null;
  }

  const trimmedValue = rawValue.trim();
  if (!trimmedValue) {
    return null;
  }

  return (trimmedValue.startsWith('0x')
    ? trimmedValue
    : `0x${trimmedValue}`) as Hex;
}
