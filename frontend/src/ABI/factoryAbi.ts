export const FACTORY_ABI = [
  // ========================
  // CONSTRUCTOR
  // ========================
  "constructor(address _platformAddress)",

  // ========================
  // WRITE FUNCTIONS
  // ========================

  "function createWill((address wallet, string name, string email)[] signers, (string name, string email, address wallet) ownerInfo) returns (address will)",

  "function setPlatformAddress(address newAddress)",

  // ========================
  // READ FUNCTIONS
  // ========================

  "function admin() view returns (address)",
  "function platformAddress() view returns (address)",
  "function totalWills() view returns (uint256)",

  "function getAllWills() view returns (address[])",
  "function getWillsByOwner(address owner) view returns (address[])",
  "function isWill(address) view returns (bool)",

  "function allWills(uint256) view returns (address)",
  "function ownerWills(address, uint256) view returns (address)",

  // ========================
  // EVENTS
  // ========================

  "event ApprovalGranted(address indexed owner, uint256 amount)",
  "event AttestationRevoked(address indexed signer, uint256 signatureCount)",

  "event BeneficiaryAdded(uint256 indexed id, address indexed wallet, uint256 percent)",
  "event BeneficiaryAddressUpdated(uint256 indexed id, address indexed oldWallet, address indexed newWallet)",
  "event BeneficiaryClaimed(uint256 indexed id, address indexed wallet, uint256 amount)",
  "event BeneficiaryRemoved(uint256 indexed id, address indexed wallet)",
  "event BeneficiaryUpdated(uint256 indexed id, address indexed wallet, uint256 oldPercent, uint256 newPercent)",

  "event CheckIn(address indexed owner, uint256 timestamp)",
  "event GracePeriodUpdated(uint256 oldPeriod, uint256 newPeriod)",
  "event InactivityPeriodUpdated(uint256 oldPeriod, uint256 newPeriod)",
  "event InactivityTriggered(address indexed triggeredBy, uint256 triggeredAt, uint256 attestationStart)",

  "event PlatformAddressUpdated(address oldAddress, address newAddress)",

  "event RecoveryRequested(address indexed newWallet)",
  "event SignerAttested(address indexed signer, uint256 signatureCount, uint256 requiredSignatures)",
  "event SignerReplaced(address indexed oldSigner, address indexed newSigner)",
  "event WalletRecovered(address indexed oldOwner, address indexed newOwner)",

  "event WillCreated(address indexed will, address indexed owner, address indexed token)",
  "event WillLocked(uint256 timestamp, uint256 finalPool, uint256 fee)"
] as const;