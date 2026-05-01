/**
 * Shared types for Web3 event tracking services
 */

export interface ApprovalEventData {
  owner: string;
  spender: string;
  value: string;
}

export interface EventLogData {
  owner: string;
  spender: string;
  value: string;
}

export interface WillAmountUpdate {
  willId: string;
  approvedAmount: string;
  effectivePullAmount: string;
  updateTimestamp: Date;
}

export interface ServiceConfig {
  pollIntervalMs: number;
  maxParallelUpdates: number;
  rpcUrl: string;
  cwtAddress: string;
}
