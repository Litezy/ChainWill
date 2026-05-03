import { useConnectModal } from '@rainbow-me/rainbowkit'

interface props {
  title?:string
  className?: string
}

export default function CustomConnectButton
({ title = "Connect Wallet", className = "" }:props) {
  const { openConnectModal } = useConnectModal()

  const handleConnectWallet = () => {
    if (openConnectModal) {
      openConnectModal()
    }
  }

  return (
    <button
      type="button"
      onClick={handleConnectWallet}
      className={`inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-base font-semibold text-white shadow-md transition-opacity hover:opacity-90 active:scale-95 ${className}`.trim()}
    >
      {title}
    </button>
  )
}
