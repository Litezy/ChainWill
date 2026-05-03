const FACTORY_ABI = [
  // ───────────── Constructor ─────────────
  {
    type: "constructor",
    inputs: [
      { name: "_platformAddress", type: "address" }
    ],
    stateMutability: "nonpayable",
  },

  // ───────────── Read Functions ─────────────
  {
    type: "function",
    name: "admin",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "platformAddress",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "totalWills",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "allWills",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "getAllWills",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address[]" }],
  },
  {
    type: "function",
    name: "getWillsByOwner",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "address[]" }],
  },
  {
    type: "function",
    name: "ownerWills",
    stateMutability: "view",
    inputs: [
      { type: "address" },
      { type: "uint256" }
    ],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "isWill",
    stateMutability: "view",
    inputs: [{ type: "address" }],
    outputs: [{ type: "bool" }],
  },

  // ───────────── Write Functions ─────────────
  {
    type: "function",
    name: "createWill",
    stateMutability: "nonpayable",
    inputs: [{ name: "signers", type: "address[]" }],
    outputs: [{ name: "will", type: "address" }],
  },
  {
    type: "function",
    name: "setPlatformAddress",
    stateMutability: "nonpayable",
    inputs: [{ name: "newAddress", type: "address" }],
    outputs: [],
  },

  // ───────────── Events ─────────────
  {
    type: "event",
    name: "WillCreated",
    inputs: [
      { indexed: true, name: "will", type: "address" },
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "token", type: "address" },
    ],
  },
  {
    type: "event",
    name: "WillLocked",
    inputs: [
      { indexed: false, name: "timestamp", type: "uint256" },
      { indexed: false, name: "finalPool", type: "uint256" },
      { indexed: false, name: "fee", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "BeneficiaryAdded",
    inputs: [
      { indexed: true, name: "id", type: "uint256" },
      { indexed: true, name: "wallet", type: "address" },
      { indexed: false, name: "percent", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "BeneficiaryClaimed",
    inputs: [
      { indexed: true, name: "id", type: "uint256" },
      { indexed: true, name: "wallet", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "CheckIn",
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "InactivityTriggered",
    inputs: [
      { indexed: true, name: "triggeredBy", type: "address" },
      { indexed: false, name: "triggeredAt", type: "uint256" },
      { indexed: false, name: "attestationStart", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "SignerAttested",
    inputs: [
      { indexed: true, name: "signer", type: "address" },
      { indexed: false, name: "signatureCount", type: "uint256" },
      { indexed: false, name: "requiredSignatures", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "SignerReplaced",
    inputs: [
      { indexed: true, name: "oldSigner", type: "address" },
      { indexed: true, name: "newSigner", type: "address" },
    ],
  },
  {
    type: "event",
    name: "WalletRecovered",
    inputs: [
      { indexed: true, name: "oldOwner", type: "address" },
      { indexed: true, name: "newOwner", type: "address" },
    ],
  },
  {
    type: "event",
    name: "PlatformAddressUpdated",
    inputs: [
      { indexed: false, name: "oldAddress", type: "address" },
      { indexed: false, name: "newAddress", type: "address" },
    ],
  },
] as const;

export default FACTORY_ABI
