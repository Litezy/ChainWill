import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prismaUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

export const prisma = new PrismaClient(
  prismaUrl
    ? {
        datasources: {
          db: {
            url: prismaUrl,
          },
        },
      }
    : undefined
);
