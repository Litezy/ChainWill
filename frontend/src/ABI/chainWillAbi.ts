export const chainWillAbi = [
  // ─────────────────────────────────────
  // CONSTRUCTOR
  // ─────────────────────────────────────
  {
    type: "constructor",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_admin", type: "address" },
      {
        name: "_signers",
        type: "tuple[]",
        components: [
          { name: "wallet", type: "address" },
          { name: "name", type: "string" },
          { name: "email", type: "string" },
        ],
      },
      { name: "_inactivityPeriod", type: "uint256" },
      { name: "_owner", type: "address" },
      { name: "_platformAddress", type: "address" },
      {
        name: "_ownerInfo",
        type: "tuple",
        components: [
          { name: "name", type: "string" },
          { name: "email", type: "string" },
          { name: "wallet", type: "address" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────
  // WRITE FUNCTIONS
  // ─────────────────────────────────────
  {
    type: "function",
    name: "addBeneficiary",
    stateMutability: "nonpayable",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "percent", type: "uint256" },
      { name: "name", type: "string" },
      { name: "email", type: "string" },
      { name: "role", type: "string" },
    ],
    outputs: [],
  },

  {
    type: "function",
    name: "updateBeneficiary",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "wallet", type: "address" },
      { name: "percent", type: "uint256" },
      { name: "name", type: "string" },
      { name: "email", type: "string" },
      { name: "role", type: "string" },
    ],
    outputs: [],
  },

  {
    type: "function",
    name: "removeBeneficiary",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },

  {
    type: "function",
    name: "replaceSigner",
    stateMutability: "nonpayable",
    inputs: [
      { name: "oldSigner", type: "address" },
      { name: "newSigner", type: "address" },
      { name: "name", type: "string" },
      { name: "email", type: "string" },
    ],
    outputs: [],
  },

  {
    type: "function",
    name: "requestWalletChange",
    stateMutability: "nonpayable",
    inputs: [{ name: "newWallet", type: "address" }],
    outputs: [],
  },

  {
    type: "function",
    name: "confirmWalletChange",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },

  { type: "function", name: "checkIn", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "claim", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },
  { type: "function", name: "triggerBySigners", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "triggerByTime", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "revokeAttestation", stateMutability: "nonpayable", inputs: [], outputs: [] },

  {
    type: "function",
    name: "setGracePeriod",
    stateMutability: "nonpayable",
    inputs: [{ name: "newGracePeriod", type: "uint256" }],
    outputs: [],
  },

  {
    type: "function",
    name: "setInactivityPeriod",
    stateMutability: "nonpayable",
    inputs: [{ name: "newPeriod", type: "uint256" }],
    outputs: [],
  },

  // ─────────────────────────────────────
  // READ FUNCTIONS
  // ─────────────────────────────────────
  { type: "function", name: "getOwner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "getToken", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "isLocked", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "isTriggered", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },

  {
    type: "function",
    name: "getOwnerProfile",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "name", type: "string" },
      { name: "email", type: "string" },
      { name: "wallet", type: "address" },
    ],
  },

  {
    type: "function",
    name: "getBeneficiaries",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "wallet", type: "address" },
          { name: "percent", type: "uint256" },
          { name: "claimed", type: "bool" },
          { name: "claimedAt", type: "uint256" },
          { name: "name", type: "string" },
          { name: "email", type: "string" },
          { name: "role", type: "string" },
        ],
      },
    ],
  },

  {
    type: "function",
    name: "getBeneficiaryByEmail",
    stateMutability: "view",
    inputs: [{ name: "email", type: "string" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "wallet", type: "address" },
          { name: "percent", type: "uint256" },
          { name: "claimed", type: "bool" },
          { name: "claimedAt", type: "uint256" },
          { name: "name", type: "string" },
          { name: "email", type: "string" },
          { name: "role", type: "string" },
        ],
      },
    ],
  },

  {
    type: "function",
    name: "getSignersWithDetails",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "wallet", type: "address" },
          { name: "signed", type: "bool" },
          { name: "signedAt", type: "uint256" },
          { name: "name", type: "string" },
          { name: "email", type: "string" },
        ],
      },
    ],
  },

  {
    type: "function",
    name: "getSignerByEmail",
    stateMutability: "view",
    inputs: [{ name: "email", type: "string" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "wallet", type: "address" },
          { name: "signed", type: "bool" },
          { name: "signedAt", type: "uint256" },
          { name: "name", type: "string" },
          { name: "email", type: "string" },
        ],
      },
    ],
  },

  {
    type: "function",
    name: "getAttestationStatus",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "_available", type: "bool" },
      { name: "count", type: "uint256" },
      { name: "required", type: "uint256" },
    ],
  },

  {
    type: "function",
    name: "getWillStatus",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "approvedAmount", type: "uint256" },
      { name: "ownerWalletBalance", type: "uint256" },
      { name: "effectivePullAmount", type: "uint256" },
      { name: "timeRemaining", type: "uint256" },
      { name: "attestationOpensAt", type: "uint256" },
      { name: "triggerUnlocksAt", type: "uint256" },
      { name: "triggered", type: "bool" },
      { name: "locked", type: "bool" },
      { name: "inactivityPeriod", type: "uint256" },
      { name: "lastCheckIn", type: "uint256" },
      { name: "gracePeriod", type: "uint256" },
      { name: "finalPool", type: "uint256" },
    ],
  },

  {
    type: "function",
    name: "remainingPercent",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },

  // ─────────────────────────────────────
  // EVENTS (important for frontend listeners)
  // ─────────────────────────────────────
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
] as const;
