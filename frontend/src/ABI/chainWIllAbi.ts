const chainWillAbi = [
  // ───────────── Constructor ─────────────
  {
    type: "constructor",
    inputs: [
      { name: "_admin", type: "address" },
      { name: "_signers", type: "address[]" },
      { name: "_inactivityPeriod", type: "uint256" },
      { name: "_owner", type: "address" },
      { name: "_platformAddress", type: "address" },
    ],
    stateMutability: "nonpayable",
  },

  // ───────────── READ FUNCTIONS ─────────────
  { type: "function", name: "getOwner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "getToken", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "getSigners", stateMutability: "view", inputs: [], outputs: [{ type: "address[]" }] },
  { type: "function", name: "getPlatformAddress", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "getPlatformFeeBP", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },

  { type: "function", name: "isLocked", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "isTriggered", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },

  { type: "function", name: "getFinalPool", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getApprovedAmount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getEffectivePullAmount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getOwnerBalance", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },

  { type: "function", name: "remainingPercent", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },

  { type: "function", name: "beneficiaryCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },

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
        ],
      },
    ],
  },

  {
    type: "function",
    name: "getOneBeneficiary",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "wallet", type: "address" },
          { name: "percent", type: "uint256" },
          { name: "claimed", type: "bool" },
          { name: "claimedAt", type: "uint256" },
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
      { name: "finalPool", type: "uint256" },
    ],
  },

  { type: "function", name: "attestationStartAt", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "claimTriggerAt", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "timeUntilTrigger", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },

  { type: "function", name: "getPendingRecoveryWallet", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },

  // ───────────── WRITE FUNCTIONS ─────────────
  {
    type: "function",
    name: "addBeneficiary",
    stateMutability: "nonpayable",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "percent", type: "uint256" },
    ],
    outputs: [],
  },

  { type: "function", name: "removeBeneficiary", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },

  {
    type: "function",
    name: "updateBeneficiaryPercentage",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "newPercent", type: "uint256" },
    ],
    outputs: [],
  },

  {
    type: "function",
    name: "updateBeneficiaryAddress",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "_newWallet", type: "address" },
    ],
    outputs: [],
  },

  { type: "function", name: "checkIn", stateMutability: "nonpayable", inputs: [], outputs: [] },

  { type: "function", name: "triggerByTime", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "triggerBySigners", stateMutability: "nonpayable", inputs: [], outputs: [] },

  { type: "function", name: "claim", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },

  { type: "function", name: "replaceSigner", stateMutability: "nonpayable", inputs: [
    { name: "oldSigner", type: "address" },
    { name: "newSigner", type: "address" },
  ], outputs: [] },

  { type: "function", name: "revokeAttestation", stateMutability: "nonpayable", inputs: [], outputs: [] },

  { type: "function", name: "requestWalletChange", stateMutability: "nonpayable", inputs: [{ name: "newWallet", type: "address" }], outputs: [] },
  { type: "function", name: "confirmWalletChange", stateMutability: "nonpayable", inputs: [], outputs: [] },

  { type: "function", name: "setGracePeriod", stateMutability: "nonpayable", inputs: [{ name: "newGracePeriod", type: "uint256" }], outputs: [] },
  { type: "function", name: "setInactivityPeriod", stateMutability: "nonpayable", inputs: [{ name: "newPeriod", type: "uint256" }], outputs: [] },

  // ───────────── EVENTS ─────────────
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
    name: "WillLocked",
    inputs: [
      { indexed: false, name: "timestamp", type: "uint256" },
      { indexed: false, name: "finalPool", type: "uint256" },
      { indexed: false, name: "fee", type: "uint256" },
    ],
  },
];

export default chainWillAbi;