"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viemClient = void 0;
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.viemClient = (0, viem_1.createPublicClient)({
    chain: chains_1.sepolia,
    transport: (0, viem_1.http)(process.env.RPC_URL),
});
