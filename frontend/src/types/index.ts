export type RawWillStatus = {
  approvedAmount: bigint;
  ownerWalletBalance: bigint;
  effectivePullAmount: bigint;
  timeRemaining: bigint;
  attestationOpensAt: bigint;
  triggerUnlocksAt: bigint;
  triggered: boolean;
  locked: boolean;
  inactivityPeriod: bigint;
  lastCheckIn: bigint;
  gracePeriod: bigint;
  finalPool: bigint;
};

export type RawOwnerProfile = [string, string, string];

export type RawBeneficiary = {
  id: bigint;
  wallet: string;
  percent: bigint;
  claimed: boolean;
  claimedAt: bigint;
  name: string;
  email: string;
  role: string;
};

export type OwnerProfile = {
  name: string;
  email: string;
  wallet: string;
};

export type WillStatus = {
  triggered: boolean;
  locked: boolean;
  finalPool: bigint;
};