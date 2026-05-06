import { errorMessage } from "@/utils/messageStatus";

/**
 * Extract readable message from ethers error
 */
export const decodeContractError = (error: any): string => {
  // 🟢 1. Direct reason (most common)
  if (error?.reason) return error.reason;

  // 🟢 2. Nested error (ethers v6 structure)
  if (error?.cause?.reason) return error.cause.reason;

  // 🟢 3. Revert data parsing
  if (error?.data?.message) return error.data.message;

  // 🟢 4. Short message (ethers v6)
  if (error?.shortMessage) return error.shortMessage;

  // 🟢 5. MetaMask / RPC error
  if (error?.message) {
    // Clean ugly RPC messages
    if (error.message.includes("execution reverted")) {
      return error.message.replace("execution reverted:", "").trim();
    }

    if (error.message.includes("user rejected")) {
      return "Transaction was rejected";
    }

    return error.message;
  }

  return "Transaction failed";
};


export const handleContractError = (error: unknown) => {
  const message = decodeContractError(error);

  console.error("Contract Error:", error);

  errorMessage(message);
};