import { ethers } from "ethers";

// Read Provider
export const readProvider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);

// Wss Provider
export const wsProvider = new ethers.WebSocketProvider(import.meta.env.VITE_RPC_URL);

// ReadWriteProvider
export const getReadWriteProvider = (provider: any) => {
    return new ethers.BrowserProvider(provider)
}