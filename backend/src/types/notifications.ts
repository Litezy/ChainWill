export type AlertCategory =
  | 'attestation-open'
  | 'funding-risk'
  | 'manual-check-in-reminder';

export interface AlertEmailPayload {
  category: AlertCategory;
  subject: string;
  to: string[];
  text: string;
  html: string;
  metadata: Record<string, unknown>;
}

export type NotificationJobData =
  | {
      type: 'attestation-open';
      willId: string;
      contractAddress: string;
      recipients: string[];
    }
  | {
      type: 'funding-risk';
      willId: string;
      contractAddress: string;
      recipients: string[];
      approvedAmount: string;
      ownerBalance: string;
      reasons: string[];
    }
  | {
      type: 'manual-check-in-reminder';
      willId: string;
      contractAddress: string;
      recipients: string[];
      ownerAddress: string;
    };


   
