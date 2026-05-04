"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminWalletClient = exports.viemClient = void 0;
exports.getAdminRelayerStatus = getAdminRelayerStatus;
exports.assertAdminRelayerConfigured = assertAdminRelayerConfigured;
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const rpcUrl = process.env.RPC_URL?.trim();
const normalizedAdminPrivateKey = normalizePrivateKey(process.env.ADMIN_PRIVATE_KEY);
let adminAccount = null;
let adminConfigurationError = null;
if (normalizedAdminPrivateKey) {
    try {
        adminAccount = (0, accounts_1.privateKeyToAccount)(normalizedAdminPrivateKey);
    }
    catch (error) {
        adminConfigurationError =
            error instanceof Error
                ? error.message
                : 'Unable to parse ADMIN_PRIVATE_KEY';
    }
}
exports.viemClient = (0, viem_1.createPublicClient)({
    transport: (0, viem_1.http)(rpcUrl),
});
exports.adminWalletClient = adminAccount
    ? (0, viem_1.createWalletClient)({
        account: adminAccount,
        transport: (0, viem_1.http)(rpcUrl),
    })
    : null;
function getAdminRelayerStatus() {
    return {
        configured: exports.adminWalletClient !== null,
        address: adminAccount?.address ?? null,
        error: adminConfigurationError,
    };
}
function assertAdminRelayerConfigured() {
    if (adminConfigurationError) {
        throw new Error(`Invalid ADMIN_PRIVATE_KEY configuration: ${adminConfigurationError}`);
    }
    if (!adminAccount || !exports.adminWalletClient) {
        throw new Error('ADMIN_PRIVATE_KEY is required for the mandatory admin relayer');
    }
    return {
        account: adminAccount,
        walletClient: exports.adminWalletClient,
    };
}
function normalizePrivateKey(rawValue) {
    if (!rawValue) {
        return null;
    }
    const trimmedValue = rawValue.trim();
    if (!trimmedValue) {
        return null;
    }
    return (trimmedValue.startsWith('0x')
        ? trimmedValue
        : `0x${trimmedValue}`);
}
