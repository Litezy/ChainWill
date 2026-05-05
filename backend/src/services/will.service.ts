import { isAddress } from 'viem';
import { prisma } from '../config/db';
import { viemClient } from '../config/web3';
import { CHAINWILL_PARSED_ABI } from '../config/abi';

function normalizeAddress(address: string, fieldName = 'address'): string {
  if (!address || !isAddress(address)) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return address.toLowerCase();
}

const willInclude = {
  beneficiaries: {
    orderBy: { beneficiaryId: 'asc' as const },
  },
  signers: {
    orderBy: { signerAddress: 'asc' as const },
  },
  erc20Approvals: {
    orderBy: { timestamp: 'desc' as const },
    take: 10,
  },
};

export const willService = {
  normalizeAddress,

  async getWillsByOwner(ownerAddress: string) {
    const owner = normalizeAddress(ownerAddress, 'ownerAddress');

    return prisma.will.findMany({
      where: { ownerAddress: owner },
      include: willInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  async getWillByAddress(willAddress: string) {
    const address = normalizeAddress(willAddress, 'willAddress');

    return prisma.will.findUnique({
      where: { contractAddress: address },
      include: willInclude,
    });
  },

  async getWillStatus(willAddress: string) {
    const address = normalizeAddress(willAddress, 'willAddress');
    const will = await prisma.will.findUnique({
      where: { contractAddress: address },
      select: {
        id: true,
        contractAddress: true,
        ownerAddress: true,
        approvedAmount: true,
        effectivePullAmount: true,
        finalPool: true,
        feePaid: true,
        inactivityPeriod: true,
        gracePeriod: true,
        lastCheckIn: true,
        isTriggered: true,
        isLocked: true,
        attestationOpen: true,
        triggeredAt: true,
      },
    });

    if (!will) {
      return null;
    }

    try {
      const [chainStatus, attestationStatus] = await Promise.all([
        viemClient.readContract({
          address: address as `0x${string}`,
          abi: CHAINWILL_PARSED_ABI,
          functionName: 'getWillStatus',
        }),
        viemClient.readContract({
          address: address as `0x${string}`,
          abi: CHAINWILL_PARSED_ABI,
          functionName: 'getAttestationStatus',
        }),
      ]);

      const [
        approvedAmount,
        ,
        effectivePullAmount,
        timeRemaining,
        attestationOpensAt,
        triggerUnlocksAt,
        triggered,
        locked,
        finalPool,
      ] = chainStatus;
      const [attestationOpen, signatureCount, requiredSignatures] = attestationStatus;

      return {
        willAddress: will.contractAddress,
        isTriggered: triggered,
        isLocked: locked,
        attestationOpen,
        approvedAmount: approvedAmount.toString(),
        effectivePullAmount: effectivePullAmount.toString(),
        finalPool: finalPool.toString(),
        feePaid: will.feePaid,
        signatureCount: signatureCount.toString(),
        requiredSignatures: requiredSignatures.toString(),
        timeLimits: {
          lastCheckIn: will.lastCheckIn,
          inactivityPeriod: will.inactivityPeriod,
          gracePeriod: will.gracePeriod,
          timeRemaining: timeRemaining.toString(),
          attestationOpensAt: new Date(Number(attestationOpensAt) * 1000),
          triggerUnlocksAt: new Date(Number(triggerUnlocksAt) * 1000),
        },
      };
    } catch (error) {
      console.warn(
        `[WillService] Falling back to DB status for ${address}:`,
        error instanceof Error ? error.message : error
      );

      return {
        willAddress: will.contractAddress,
        isTriggered: will.isTriggered,
        isLocked: will.isLocked,
        attestationOpen: will.attestationOpen,
        approvedAmount: will.approvedAmount,
        effectivePullAmount: will.effectivePullAmount,
        finalPool: will.finalPool,
        feePaid: will.feePaid,
        triggeredAt: will.triggeredAt,
        timeLimits: {
          lastCheckIn: will.lastCheckIn,
          inactivityPeriod: will.inactivityPeriod,
          gracePeriod: will.gracePeriod,
          attestationOpensAt: new Date(
            will.lastCheckIn.getTime() + will.inactivityPeriod * 1000
          ),
          triggerUnlocksAt: new Date(
            will.lastCheckIn.getTime() + (will.inactivityPeriod + will.gracePeriod) * 1000
          ),
        },
      };
    }
  },

  async getBeneficiaries(willAddress: string) {
    const will = await this.getWillByAddress(willAddress);
    return will ? will.beneficiaries : null;
  },

  async getSigners(willAddress: string) {
    const will = await this.getWillByAddress(willAddress);
    return will ? will.signers : null;
  },

  async getClaimsByBeneficiary(walletAddress: string) {
    const wallet = normalizeAddress(walletAddress, 'walletAddress');

    return prisma.beneficiary.findMany({
      where: { walletAddress: wallet },
      include: {
        will: {
          include: {
            signers: {
              orderBy: { signerAddress: 'asc' },
            },
          },
        },
      },
      orderBy: { will: { createdAt: 'desc' } },
    });
  },

  async getWillsBySigner(walletAddress: string) {
    const wallet = normalizeAddress(walletAddress, 'walletAddress');

    return prisma.signer.findMany({
      where: {
        signerAddress: wallet,
        replacedAt: null,
      },
      include: {
        will: {
          include: {
            beneficiaries: {
              orderBy: { beneficiaryId: 'asc' },
            },
          },
        },
      },
      orderBy: { will: { createdAt: 'desc' } },
    });
  },
};
