export function parseContractError(msg: string) {
  if (msg.includes('Not owner')) return 'You are not the owner'
  if (msg.includes('Locked')) return 'Will is already locked'
  if (msg.includes('Not signer')) return 'You are not a signer'

  return msg
}