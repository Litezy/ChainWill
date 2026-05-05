export const TOKEN_ABI = [
  // ───────────── Constructor ─────────────
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable",
  },

  // ───────────── ERC20 EVENTS ─────────────
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "_from", type: "address", indexed: true },
      { name: "_to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "spender", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },

  // ───────────── CUSTOM EVENTS ─────────────
  {
    type: "event",
    name: "Mint",
    inputs: [
      { name: "_to", type: "address", indexed: true },
      { name: "_amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "TokensRequested",
    inputs: [
      { name: "_user", type: "address", indexed: true },
      { name: "_amount", type: "uint256", indexed: false },
      { name: "_time", type: "uint256", indexed: false },
    ],
  },

  // ───────────── TOKEN INFO ─────────────
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "MAX_SUPPLY",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },

  // ───────────── FAUCET CONFIG ─────────────
  {
    type: "function",
    name: "REQUEST_AMOUNT",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "REQUEST_INTERVAL",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },

  // ───────────── BALANCES & ALLOWANCES ─────────────
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },

  // ───────────── FAUCET STATE ─────────────
  {
    type: "function",
    name: "canRequest",
    stateMutability: "view",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "lastRequestTime",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "timeUntilNextRequest",
    stateMutability: "view",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },

  // ───────────── ERC20 ACTIONS ─────────────
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_to", type: "address" },
      { name: "_amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "transferFrom",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_from", type: "address" },
      { name: "_to", type: "address" },
      { name: "_amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },

  // ───────────── TOKEN CONTROL ─────────────
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_to", type: "address" },
      { name: "_amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "burn",
    stateMutability: "nonpayable",
    inputs: [{ name: "_amount", type: "uint256" }],
    outputs: [],
  },

  // ───────────── FAUCET ACTION ─────────────
  {
    type: "function",
    name: "requestToken",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },

  // ───────────── OWNERSHIP ─────────────
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "transferOwnership",
    stateMutability: "nonpayable",
    inputs: [{ name: "_newOwner", type: "address" }],
    outputs: [],
  },
] as const;