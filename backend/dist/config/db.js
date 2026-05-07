"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const prismaUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
exports.prisma = new client_1.PrismaClient(prismaUrl ? { datasourceUrl: prismaUrl } : undefined);
