import dotenv from 'dotenv';
import type { AlertEmailPayload, NotificationJobData } from '../types/notifications';

dotenv.config();

interface RecipientResolverInput {
  address: string;
  email?: string | null;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHtmlBody(lines: string[]): string {
  return [
    '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">',
    ...lines.map((line) => `<p>${escapeHtml(line)}</p>`),
    '</div>',
  ].join('');
}

function parseEmailOverrides(): Record<string, string> {
  const raw = process.env.ALERT_EMAIL_OVERRIDES;

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return Object.fromEntries(
      Object.entries(parsed).map(([address, email]) => [
        address.toLowerCase(),
        email,
      ])
    );
  } catch (error) {
    console.error(
      '[AlertDispatcher] Failed to parse ALERT_EMAIL_OVERRIDES:',
      error instanceof Error ? error.message : error
    );
    return {};
  }
}

export class AlertDispatcherService {
  private readonly resendApiKey = process.env.RESEND_API_KEY;
  private readonly emailFrom =
    process.env.ALERT_EMAIL_FROM || 'ChainWill <onboarding@resend.dev>';
  private readonly emailReplyTo = process.env.ALERT_EMAIL_REPLY_TO;
  private readonly emailOverrides = parseEmailOverrides();

  resolveRecipientEmail(input: RecipientResolverInput): string | null {
    const normalizedAddress = input.address.toLowerCase();

    if (input.email) {
      return input.email;
    }

    return this.emailOverrides[normalizedAddress] ?? null;
  }

  buildEmailPayload(job: NotificationJobData): AlertEmailPayload {
    if (job.type === 'attestation-open') {
      const lines = [
        `Attestation is now open for will ${job.willId}.`,
        `Contract address: ${job.contractAddress}.`,
        'Please review and act if attestation is required.',
      ];

      return {
        category: job.type,
        subject: 'Attestation Open',
        to: job.recipients,
        text: lines.join('\n'),
        html: renderHtmlBody(lines),
        metadata: {
          willId: job.willId,
          contractAddress: job.contractAddress,
        },
      };
    }

    if (job.type === 'manual-check-in-reminder') {
      const lines = [
        `This is a manual check-in reminder for will ${job.willId}.`,
        `Contract address: ${job.contractAddress}.`,
        `Owner address: ${job.ownerAddress}.`,
        'Please check in to confirm that you are still active on ChainWill.',
      ];

      return {
        category: job.type,
        subject: 'Check-In Reminder',
        to: job.recipients,
        text: lines.join('\n'),
        html: renderHtmlBody(lines),
        metadata: {
          willId: job.willId,
          contractAddress: job.contractAddress,
          ownerAddress: job.ownerAddress,
        },
      };
    }

    const lines = [
      `Funding risk detected for will ${job.willId}.`,
      `Contract address: ${job.contractAddress}.`,
      `Approved amount: ${job.approvedAmount}.`,
      `Owner balance: ${job.ownerBalance}.`,
      `Reason: ${job.reasons.join(', ')}.`,
    ];

    return {
      category: job.type,
      subject: 'Funding Risk Alert',
      to: job.recipients,
      text: lines.join('\n'),
      html: renderHtmlBody(lines),
      metadata: {
        willId: job.willId,
        contractAddress: job.contractAddress,
        approvedAmount: job.approvedAmount,
        ownerBalance: job.ownerBalance,
        reasons: job.reasons,
      },
    };
  }

  async sendAlertEmail(payload: AlertEmailPayload): Promise<void> {
    if (payload.to.length === 0) {
      console.warn(
        `[AlertDispatcher] Skipping ${payload.category} alert because no recipients were resolved`
      );
      return;
    }

    if (!this.resendApiKey) {
      console.log(
        `[AlertDispatcher] ${payload.category} alert prepared for ${payload.to.join(', ')}`
      );
      console.log(payload.text);
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.emailFrom,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
        reply_to: this.emailReplyTo,
        tags: [
          { name: 'category', value: payload.category },
          { name: 'source', value: 'chainwill-monitor' },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Resend request failed with ${response.status} ${response.statusText}: ${body}`
      );
    }
  }
}

export const alertDispatcher = new AlertDispatcherService();
