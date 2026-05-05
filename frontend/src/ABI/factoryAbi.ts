const FACTORY_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "_platformAddress", type: "address", internalType: "address" }
    ],
    stateMutability: "nonpayable",
  },

  // READ
  {
    type: "function",
    name: "admin",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
  },
  {
    type: "function",
    name: "platformAddress",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
  },
  {
    type: "function",
    name: "totalWills",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "function",
    name: "getAllWills",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
  },

  {
    type: "function",
    name: "getWillsByOwner",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
  },

  {
    type: "function",
    name: "isWill",
    stateMutability: "view",
    inputs: [{ name: "will", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
  },

  // WRITE
  {
    type: "function",
    name: "createWill",
    stateMutability: "nonpayable",
    inputs: [{ name: "signers", type: "address[]", internalType: "address[]" }],
    outputs: [{ name: "will", type: "address", internalType: "address" }],
  },

  {
    type: "function",
    name: "setPlatformAddress",
    stateMutability: "nonpayable",
    inputs: [{ name: "newAddress", type: "address", internalType: "address" }],
    outputs: [],
  },

  // EVENTS
  {
    type: "event",
    name: "WillCreated",
    inputs: [
      { indexed: true, name: "will", type: "address", internalType: "address" },
      { indexed: true, name: "owner", type: "address", internalType: "address" },
      { indexed: true, name: "token", type: "address", internalType: "address" },
    ],
    anonymous: false,
  },

  {
    type: "event",
    name: "PlatformAddressUpdated",
    inputs: [
      { indexed: false, name: "oldAddress", type: "address", internalType: "address" },
      { indexed: false, name: "newAddress", type: "address", internalType: "address" },
    ],
    anonymous: false,
  },
] as const;

export default FACTORY_ABI