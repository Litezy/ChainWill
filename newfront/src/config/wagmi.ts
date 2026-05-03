import { getDefaultConfig, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit'
import { metaMaskWallet, rainbowWallet, walletConnectWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets'
import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'

const { wallets } = getDefaultWallets({
  appName: 'ChainWill',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
})

const connectors = connectorsForWallets(
  [
    ...wallets,
    {
      groupName: 'More',
      wallets: [metaMaskWallet], // 👈 explicitly add MetaMask
    },
  ],
  {
    appName: 'ChainWill',
    projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  }
)

export const config = createConfig({
  connectors,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: false,
})