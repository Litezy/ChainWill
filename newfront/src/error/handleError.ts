import toast from 'react-hot-toast'

export function handleError(error: any) {
  console.error(error)

  let message = 'Something went wrong'

  // ── viem / wagmi errors ─────────────────────────
  if (error?.shortMessage) {
    message = error.shortMessage
  }

  // ── metamask / rpc errors ───────────────────────
  else if (error?.message) {
    message = error.message
  }

  // ── contract reverts (decoded sometimes) ────────
  if (message.includes('User rejected')) {
    message = 'Transaction rejected by user'
  }

  if (message.includes('insufficient funds')) {
    message = 'Insufficient balance for transaction'
  }

  if (message.includes('execution reverted')) {
    message = 'Contract execution failed'
  }

  toast.error(message)
}