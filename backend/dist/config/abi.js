"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAINWILL_ABI = exports.CWT_ABI = exports.CWT_ADDRESS = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.CWT_ADDRESS = (process.env.CWT_ADDRESS ||
    '0x9b068dC0418064C11d9bc563edC26890DD95a60e').toLowerCase();
exports.CWT_ABI = [
    {
        type: 'event',
        name: 'Approval',
        inputs: [
            { name: 'owner', type: 'address', indexed: true },
            { name: 'spender', type: 'address', indexed: true },
            { name: 'value', type: 'uint256', indexed: false },
        ],
    },
];
exports.CHAINWILL_ABI = [
    {
        name: 'getEffectivePullAmount',
        type: 'function',
        inputs: [],
        outputs: [{ type: 'uint256', name: '' }],
        stateMutability: 'view',
    },
    {
        name: 'getOwnerBalance',
        type: 'function',
        inputs: [],
        outputs: [{ type: 'uint256', name: '' }],
        stateMutability: 'view',
    },
    {
        name: 'getApprovedAmount',
        type: 'function',
        inputs: [],
        outputs: [{ type: 'uint256', name: '' }],
        stateMutability: 'view',
    },
];
