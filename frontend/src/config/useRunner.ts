import { useEffect, useMemo, useState } from "react"
import { useAccount, useWalletClient } from "wagmi"
import { BrowserProvider, JsonRpcSigner, type Eip1193Provider } from "ethers"
import { readProvider } from "@/lib/ethers"

const useRunners = () => {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()

  const [signer, setSigner] = useState<JsonRpcSigner>()

  const provider = useMemo(() => {
    if (!walletClient) return null
    return new BrowserProvider(walletClient.transport as unknown as Eip1193Provider)
  }, [walletClient])

  useEffect(() => {
    if (!provider) {
      setSigner(undefined)
      return
    }

    let isMounted = true

    provider.getSigner().then((newSigner) => {
      if (isMounted) {
        setSigner(newSigner)
      }
    }).catch(() => {
      if (isMounted) {
        setSigner(undefined)
      }
    })

    return () => {
      isMounted = false
    }
  }, [provider, address])

  return {
    provider,
    signer,
    readOnlyProvider: readProvider,
  }
}

export default useRunners
