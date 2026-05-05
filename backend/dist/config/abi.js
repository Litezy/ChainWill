"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAINWILL_PARSED_ABI = exports.FACTORY_PARSED_ABI = exports.CHAINWILL_ABI = exports.FACTORY_ABI = exports.CWT_ABI = exports.FACTORY_ADDRESS = exports.CWT_ADDRESS = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const viem_1 = require("viem");
dotenv_1.default.config();
exports.CWT_ADDRESS = (process.env.CWT_ADDRESS ||
    '0x9b068dC0418064C11d9bc563edC26890DD95a60e').toLowerCase();
exports.FACTORY_ADDRESS = (process.env.FACTORY_ADDRESS ||
    '0x8ea15250e4fA0924900C622a4dd5694f0B4f52E7').toLowerCase();
// ===== CWT ABI =====
exports.CWT_ABI = [
    {
        type: 'event',
        name: 'Approval',
        inputs: [
            { type: 'address', name: 'owner', indexed: true },
            { type: 'address', name: 'spender', indexed: true },
            { type: 'uint256', name: 'value' }
        ]
    }
];
// ===== FACTORY ABI =====
exports.FACTORY_ABI = [
    "constructor(address _platformAddress)",
    "event WillCreated(address indexed will, address indexed owner, address indexed token)",
    "function admin() view returns (address)",
    "function getAllWills() view returns (address[])",
    "function getWillsByOwner(address owner) view returns (address[])",
    "function isWill(address) view returns (bool)",
    "function totalWills() view returns (uint256)",
    "function createWill(address[] signers) returns (address)",
    "function setPlatformAddress(address newAddress)"
];
// ===== CHILD (WILL) ABI =====
exports.CHAINWILL_ABI = [
    "constructor(address _admin, address[] _signers, uint256 _inactivityPeriod, address _owner, address _platformAddress)",
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
    "event RecoveryRequested(address indexed newWallet)",
    "event SignerAttested(address indexed signer, uint256 signatureCount, uint256 requiredSignatures)",
    "event SignerReplaced(address indexed oldSigner, address indexed newSigner)",
    "event WalletRecovered(address indexed oldOwner, address indexed newOwner)",
    "event WillCreated(address indexed will, address indexed owner, address indexed token)",
    "event WillLocked(uint256 timestamp, uint256 finalPool, uint256 fee)",
    "function addBeneficiary(address wallet, uint256 percent)",
    "function checkIn()",
    "function claim(uint256 id)",
    "function confirmWalletChange()",
    "function removeBeneficiary(uint256 id)",
    "function replaceSigner(address oldSigner, address newSigner)",
    "function requestWalletChange(address newWallet)",
    "function revokeAttestation()",
    "function setGracePeriod(uint256 newGracePeriod)",
    "function setInactivityPeriod(uint256 newPeriod)",
    "function triggerBySigners()",
    "function triggerByTime()",
    "function updateBeneficiaryAddress(uint256 id, address _newWallet)",
    "function updateBeneficiaryPercentage(uint256 id, uint256 newPercent)",
    "function attestationStartAt() view returns (uint256)",
    "function beneficiaryCount() view returns (uint256)",
    "function claimTriggerAt() view returns (uint256)",
    "function getApprovedAmount() view returns (uint256)",
    "function getAttestationStatus() view returns (bool, uint256, uint256)",
    "function getBeneficiaries() view returns ((uint256 id, address wallet, uint256 percent, bool claimed, uint256 claimedAt)[])",
    "function getEffectivePullAmount() view returns (uint256)",
    "function getFinalPool() view returns (uint256)",
    "function getOneBeneficiary(uint256 _id) view returns (uint256 id, address wallet, uint256 percent, bool claimed, uint256 claimedAt)",
    "function getOwner() view returns (address)",
    "function getOwnerBalance() view returns (uint256)",
    "function getPendingRecoveryWallet() view returns (address)",
    "function getPlatformAddress() view returns (address)",
    "function getPlatformFeeBP() view returns (uint256)",
    "function getSigners() view returns (address[])",
    "function getToken() view returns (address)",
    "function getWillStatus() view returns (uint256, uint256, uint256, uint256, uint256, uint256, bool, bool, uint256)",
    "function isLocked() view returns (bool)",
    "function isTriggered() view returns (bool)",
    "function remainingPercent() view returns (uint256)",
    "function timeUntilTrigger() view returns (uint256)"
];
exports.FACTORY_PARSED_ABI = (0, viem_1.parseAbi)(exports.FACTORY_ABI);
exports.CHAINWILL_PARSED_ABI = (0, viem_1.parseAbi)(exports.CHAINWILL_ABI);
