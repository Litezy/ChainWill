import dotenv from 'dotenv';
import handlebars from 'handlebars';
import nodemailer, {
  type SentMessageInfo,
  type Transporter,
} from 'nodemailer';
import type {
  BeneficiaryClaimEmailInput,
  OwnerWillCreatedEmailInput,
  RenderedEmailTemplate,
  SendMailInput,
  SignerReminderEmailInput,
  VerificationAudience,
  VerificationOtpEmailInput,
} from '../types/email';

dotenv.config();

interface LayoutContext {
  previewText: string;
  heading: string;
  bodyHtml: string;
  bodyText: string;
  actionLabel?: string;
  actionUrl?: string;
  supportEmail: string;
  currentYear: number;
}

interface TemplateDefinition<Context> {
  subject: handlebars.TemplateDelegate<Context>;
  previewText: handlebars.TemplateDelegate<Context>;
  heading: handlebars.TemplateDelegate<Context>;
  htmlBody: handlebars.TemplateDelegate<Context>;
  textBody: handlebars.TemplateDelegate<Context>;
  actionLabel?: handlebars.TemplateDelegate<Context>;
  actionUrl?: (context: Context) => string | undefined;
}

const handlebarsInstance = handlebars.create();

const baseHtmlTemplate = handlebarsInstance.compile<LayoutContext>(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{heading}}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,sans-serif;color:#111827;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      {{previewText}}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f7fb;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background-color:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:32px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;">
                <p style="margin:0 0 12px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;">ChainWill</p>
                <h1 style="margin:0;font-size:28px;line-height:1.2;">{{heading}}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 32px 16px;font-size:16px;line-height:1.7;color:#1f2937;">
                {{{bodyHtml}}}
              </td>
            </tr>
            {{#if actionUrl}}
            <tr>
              <td style="padding:0 32px 24px;">
                <a href="{{actionUrl}}" style="display:inline-block;padding:14px 24px;border-radius:999px;background-color:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;">
                  {{actionLabel}}
                </a>
              </td>
            </tr>
            {{/if}}
            <tr>
              <td style="padding:0 32px 32px;font-size:14px;line-height:1.7;color:#4b5563;">
                <p style="margin:0 0 8px;">If you need help, reply to this email or contact <a href="mailto:{{supportEmail}}" style="color:#2563eb;text-decoration:none;">{{supportEmail}}</a>.</p>
                <p style="margin:0;">&copy; {{currentYear}} ChainWill. Secure planning for digital inheritance.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`);

const baseTextTemplate = handlebarsInstance.compile<LayoutContext>(`{{heading}}

{{bodyText}}
{{#if actionUrl}}

{{actionLabel}}: {{actionUrl}}
{{/if}}

Need help? Contact {{supportEmail}}.

© {{currentYear}} ChainWill`);

const ownerWillCreatedTemplate: TemplateDefinition<OwnerWillCreatedTemplateContext> = {
  subject: handlebarsInstance.compile(
    'Congratulations {{ownerName}}, your ChainWill has been created'
  ),
  previewText: handlebarsInstance.compile(
    'Your will is now live on-chain. Save your contract address and review the next steps.'
  ),
  heading: handlebarsInstance.compile('Your ChainWill is now live'),
  htmlBody: handlebarsInstance.compile(`
    <p style="margin:0 0 16px;">Congratulations {{ownerName}},</p>
    <p style="margin:0 0 16px;">Your ChainWill has been created successfully and your instructions are now anchored to the blockchain. This is the formal confirmation that your digital will setup is complete.</p>
    <div style="margin:24px 0;padding:20px;border:1px solid #dbeafe;border-radius:16px;background-color:#eff6ff;">
      <p style="margin:0 0 10px;"><strong>Owner name:</strong> {{ownerName}}</p>
      <p style="margin:0;"><strong>Contract address:</strong><br /><span style="font-family:'Courier New',monospace;font-size:14px;word-break:break-all;">{{contractAddress}}</span></p>
    </div>
    <p style="margin:0 0 16px;">This contract address is the on-chain reference for your will. Keep it somewhere safe so you can review activity, manage beneficiaries, and verify the state of your inheritance plan whenever needed.</p>
    <p style="margin:0 0 12px;"><strong>Recommended next steps:</strong></p>
    <ul style="margin:0 0 16px 20px;padding:0;">
      <li style="margin-bottom:8px;">Review the beneficiaries and signers attached to this will.</li>
      <li style="margin-bottom:8px;">Ensure the funding wallet and token approvals match the assets you intend to pass on.</li>
      <li style="margin-bottom:8px;">Store this contract address with your estate records for future reference.</li>
    </ul>
    {{#if explorerUrl}}
    <p style="margin:0 0 16px;">You can also inspect the contract on-chain here: <a href="{{explorerUrl}}" style="color:#2563eb;text-decoration:none;">View contract details</a>.</p>
    {{/if}}
    <p style="margin:0;">Thank you for trusting ChainWill with an important part of your legacy planning.</p>
  `),
  textBody: handlebarsInstance.compile(`
Congratulations {{ownerName}},

Your ChainWill has been created successfully and is now recorded on-chain.

Owner name: {{ownerName}}
Contract address: {{contractAddress}}

This contract address is the on-chain reference for your will. Save it with your records.

Recommended next steps:
- Review your beneficiaries and signers.
- Confirm the wallet and token approvals that fund the will.
- Keep the contract address accessible for future monitoring.

{{#if explorerUrl}}Explorer: {{explorerUrl}}{{/if}}

Thank you for trusting ChainWill with your inheritance planning.
  `),
  actionLabel: handlebarsInstance.compile('Open your will dashboard'),
  actionUrl: (context) => context.dashboardUrl,
};

const signerReminderTemplate: TemplateDefinition<SignerReminderTemplateContext> = {
  subject: handlebarsInstance.compile(
    'Reminder: please sign the ChainWill attestation for {{ownerName}}'
  ),
  previewText: handlebarsInstance.compile(
    'A signer action is pending. Open the secure signing page and complete your attestation.'
  ),
  heading: handlebarsInstance.compile('Signer action required'),
  htmlBody: handlebarsInstance.compile(`
    <p style="margin:0 0 16px;">Hello {{signerName}},</p>
    <p style="margin:0 0 16px;">You were designated as a trusted signer for {{ownerName}}'s ChainWill. Your attestation is currently required, and we are sending this reminder so you can complete the process without delay.</p>
    <div style="margin:24px 0;padding:20px;border:1px solid #e5e7eb;border-radius:16px;background-color:#f9fafb;">
      <p style="margin:0 0 10px;"><strong>Will owner:</strong> {{ownerName}}</p>
      <p style="margin:0 0 10px;"><strong>Contract address:</strong><br /><span style="font-family:'Courier New',monospace;font-size:14px;word-break:break-all;">{{contractAddress}}</span></p>
      {{#if attestationWindowLabel}}
      <p style="margin:0;"><strong>Current signing window:</strong> {{attestationWindowLabel}}</p>
      {{/if}}
    </div>
    <p style="margin:0 0 16px;">When you open the signing page, you will be guided through email verification and the attestation step needed to confirm your role. Please complete the flow only if you recognize this request and were intentionally assigned as a signer.</p>
    <p style="margin:0 0 16px;">If you are unable to sign right now, return to the same secure link later. The reminder link below takes you directly to the signing experience.</p>
    <p style="margin:0;">Thank you for helping protect the integrity of this will.</p>
  `),
  textBody: handlebarsInstance.compile(`
Hello {{signerName}},

You were designated as a trusted signer for {{ownerName}}'s ChainWill and your attestation is currently required.

Will owner: {{ownerName}}
Contract address: {{contractAddress}}
{{#if attestationWindowLabel}}Signing window: {{attestationWindowLabel}}{{/if}}

Open the signing page, verify your email, and complete the attestation flow when you are ready.

Only proceed if you recognize this request and were intentionally assigned as a signer.
  `),
  actionLabel: handlebarsInstance.compile('Open secure signing page'),
  actionUrl: (context) => context.signingPageUrl,
};

const beneficiaryClaimTemplate: TemplateDefinition<BeneficiaryClaimTemplateContext> = {
  subject: handlebarsInstance.compile(
    'Your ChainWill inheritance claim for {{allocationPercentageLabel}} is ready'
  ),
  previewText: handlebarsInstance.compile(
    'Your beneficiary allocation is ready to be reviewed and claimed through the secure claim page.'
  ),
  heading: handlebarsInstance.compile('Beneficiary claim available'),
  htmlBody: handlebarsInstance.compile(`
    <p style="margin:0 0 16px;">Hello {{beneficiaryName}},</p>
    <p style="margin:0 0 16px;">You have been identified as a beneficiary in {{ownerName}}'s ChainWill. The allocation assigned to you is now available for review and claim through the secure ChainWill claim flow.</p>
    <div style="margin:24px 0;padding:20px;border:1px solid #dcfce7;border-radius:16px;background-color:#f0fdf4;">
      <p style="margin:0 0 10px;"><strong>Beneficiary name:</strong> {{beneficiaryName}}</p>
      <p style="margin:0 0 10px;"><strong>Will owner:</strong> {{ownerName}}</p>
      <p style="margin:0 0 10px;"><strong>Your allocation:</strong> {{allocationPercentageLabel}}</p>
      <p style="margin:0;"><strong>Contract address:</strong><br /><span style="font-family:'Courier New',monospace;font-size:14px;word-break:break-all;">{{contractAddress}}</span></p>
    </div>
    <p style="margin:0 0 16px;">On the claim page, you will verify your email, connect the correct wallet, and confirm the claim associated with this contract. Please use the secure link below and do not forward it to anyone else.</p>
    <p style="margin:0 0 16px;">If the information above does not look familiar, do not interact with the claim page until you have confirmed the request with the will owner or the ChainWill support team.</p>
    <p style="margin:0;">Once your verification is complete, you will be able to proceed with your claim steps on-chain.</p>
  `),
  textBody: handlebarsInstance.compile(`
Hello {{beneficiaryName}},

You have been listed as a beneficiary in {{ownerName}}'s ChainWill.

Beneficiary name: {{beneficiaryName}}
Will owner: {{ownerName}}
Your allocation: {{allocationPercentageLabel}}
Contract address: {{contractAddress}}

Use the secure claim link to verify your email, connect the correct wallet, and proceed with the claim flow.

If this message is unexpected, confirm the request before taking any action.
  `),
  actionLabel: handlebarsInstance.compile('Open secure claim page'),
  actionUrl: (context) => context.claimPageUrl,
};

const verificationOtpTemplate: TemplateDefinition<VerificationOtpTemplateContext> = {
  subject: handlebarsInstance.compile(
    'Your ChainWill verification code for {{audienceLabel}} access'
  ),
  previewText: handlebarsInstance.compile(
    'Use this one-time code to verify your email and continue your secure ChainWill session.'
  ),
  heading: handlebarsInstance.compile('Verify your email address'),
  htmlBody: handlebarsInstance.compile(`
    <p style="margin:0 0 16px;">Hello {{recipientName}},</p>
    <p style="margin:0 0 16px;">Use the one-time password below to verify your email and continue as a {{audienceLabel}} on ChainWill.</p>
    {{#if purpose}}
    <p style="margin:0 0 16px;">This code was generated for: <strong>{{purpose}}</strong>.</p>
    {{/if}}
    <div style="margin:24px 0;padding:24px;border-radius:16px;background-color:#111827;color:#ffffff;text-align:center;">
      <p style="margin:0 0 10px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.8;">One-time password</p>
      <p style="margin:0;font-size:36px;font-weight:700;letter-spacing:0.3em;">{{otpCode}}</p>
    </div>
    <p style="margin:0 0 16px;">This code expires in {{expiresInMinutes}} minutes. For your security, do not share it with anyone.</p>
    {{#if contractAddress}}
    <p style="margin:0 0 16px;">Verification is connected to contract <span style="font-family:'Courier New',monospace;font-size:14px;word-break:break-all;">{{contractAddress}}</span>.</p>
    {{/if}}
    <p style="margin:0;">If you did not request this code, you can ignore this email. No action will be taken unless the code is used.</p>
  `),
  textBody: handlebarsInstance.compile(`
Hello {{recipientName}},

Use the one-time password below to verify your email and continue as a {{audienceLabel}} on ChainWill.

OTP: {{otpCode}}
Expires in: {{expiresInMinutes}} minutes
{{#if purpose}}Purpose: {{purpose}}{{/if}}
{{#if contractAddress}}Contract address: {{contractAddress}}{{/if}}

Do not share this code with anyone. If you did not request it, ignore this email.
  `),
  actionLabel: handlebarsInstance.compile('Return to verification page'),
  actionUrl: (context) => context.verificationPageUrl,
};

interface OwnerWillCreatedTemplateContext {
  ownerName: string;
  contractAddress: string;
  dashboardUrl?: string;
  explorerUrl?: string;
}

interface SignerReminderTemplateContext {
  signerName: string;
  ownerName: string;
  contractAddress: string;
  signingPageUrl: string;
  attestationWindowLabel?: string;
}

interface BeneficiaryClaimTemplateContext {
  beneficiaryName: string;
  ownerName: string;
  allocationPercentageLabel: string;
  contractAddress: string;
  claimPageUrl: string;
}

interface VerificationOtpTemplateContext {
  recipientName: string;
  audienceLabel: string;
  otpCode: string;
  expiresInMinutes: number;
  contractAddress?: string;
  verificationPageUrl?: string;
  purpose?: string;
}

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function normalizeRecipients(to: string | string[]): string[] {
  return Array.isArray(to) ? to : [to];
}

function normalizePercentage(value: number | string): string {
  if (typeof value === 'number') {
    if (value > 100) {
      const asPercent = value / 100;
      return Number.isInteger(asPercent) ? `${asPercent}%` : `${asPercent.toFixed(2)}%`;
    }

    return `${value}%`;
  }

  const trimmed = value.trim();
  return trimmed.endsWith('%') ? trimmed : `${trimmed}%`;
}

export class MailerService {
  private readonly from =
    process.env.MAIL_FROM ||
    process.env.ALERT_EMAIL_FROM ||
    'ChainWill <no-reply@chainwill.local>';

  private readonly replyTo =
    process.env.MAIL_REPLY_TO || process.env.ALERT_EMAIL_REPLY_TO;

  private readonly supportEmail =
    process.env.MAIL_SUPPORT_EMAIL ||
    this.replyTo ||
    'support@chainwill.local';

  private readonly frontendBaseUrl =
    process.env.APP_FRONTEND_URL || 'https://chain-will.vercel.app';

  private readonly transporter: Transporter;
  private readonly previewTransport: boolean;

  constructor() {
    const smtpHost = process.env.SMTP_HOST;

    if (!smtpHost) {
      this.previewTransport = true;
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        buffer: true,
        newline: 'unix',
      });
      return;
    }

    this.previewTransport = false;
    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number.parseInt(process.env.SMTP_PORT || '587', 10),
      secure: parseBooleanEnv(process.env.SMTP_SECURE, false),
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });
  }

  async sendMail(input: SendMailInput): Promise<SentMessageInfo> {
    const info = await this.transporter.sendMail({
      from: this.from,
      replyTo: this.replyTo,
      to: normalizeRecipients(input.to),
      subject: input.subject,
      html: input.html,
      text: input.text,
      headers: input.headers,
    });

    if (this.previewTransport && info.message) {
      const preview =
        typeof info.message === 'string'
          ? info.message
          : Buffer.isBuffer(info.message)
            ? info.message.toString('utf8')
            : String(info.message);

      console.log('[MailerService] SMTP not configured. Generated preview email:\n');
      console.log(preview);
    }

    return info;
  }

  renderOwnerWillCreatedEmail(
    input: OwnerWillCreatedEmailInput
  ): RenderedEmailTemplate {
    return this.renderTemplate(ownerWillCreatedTemplate, {
      ownerName: input.ownerName,
      contractAddress: input.contractAddress,
      dashboardUrl:
        input.dashboardUrl || this.buildAdminDashboardUrl(input.contractAddress),
      explorerUrl: input.explorerUrl,
    }, input.supportEmail);
  }

  async sendOwnerWillCreatedEmail(
    input: OwnerWillCreatedEmailInput
  ): Promise<SentMessageInfo> {
    const rendered = this.renderOwnerWillCreatedEmail(input);
    return this.sendMail({
      to: input.ownerEmail,
      ...rendered,
    });
  }

  renderSignerReminderEmail(
    input: SignerReminderEmailInput
  ): RenderedEmailTemplate {
    return this.renderTemplate(signerReminderTemplate, {
      signerName: input.signerName,
      ownerName: input.ownerName,
      contractAddress: input.contractAddress,
      signingPageUrl:
        input.signingPageUrl ||
        this.buildSigningPageUrl(input.signerEmail, input.contractAddress),
      attestationWindowLabel: input.attestationWindowLabel,
    }, input.supportEmail);
  }

  async sendSignerReminderEmail(
    input: SignerReminderEmailInput
  ): Promise<SentMessageInfo> {
    const rendered = this.renderSignerReminderEmail(input);
    return this.sendMail({
      to: input.signerEmail,
      ...rendered,
    });
  }

  renderBeneficiaryClaimEmail(
    input: BeneficiaryClaimEmailInput
  ): RenderedEmailTemplate {
    return this.renderTemplate(beneficiaryClaimTemplate, {
      beneficiaryName: input.beneficiaryName,
      ownerName: input.ownerName,
      allocationPercentageLabel: normalizePercentage(input.allocationPercentage),
      contractAddress: input.contractAddress,
      claimPageUrl:
        input.claimPageUrl ||
        this.buildClaimPageUrl(input.beneficiaryEmail, input.contractAddress),
    }, input.supportEmail);
  }

  async sendBeneficiaryClaimEmail(
    input: BeneficiaryClaimEmailInput
  ): Promise<SentMessageInfo> {
    const rendered = this.renderBeneficiaryClaimEmail(input);
    return this.sendMail({
      to: input.beneficiaryEmail,
      ...rendered,
    });
  }

  renderVerificationOtpEmail(
    input: VerificationOtpEmailInput
  ): RenderedEmailTemplate {
    return this.renderTemplate(verificationOtpTemplate, {
      recipientName: input.recipientName,
      audienceLabel: input.audience === 'signer' ? 'signer' : 'beneficiary',
      otpCode: input.otpCode,
      expiresInMinutes: input.expiresInMinutes,
      contractAddress: input.contractAddress,
      verificationPageUrl:
        input.verificationPageUrl ||
        this.buildVerificationPageUrl(
          input.recipientEmail,
          input.audience,
          input.contractAddress
        ),
      purpose: input.purpose,
    }, input.supportEmail);
  }

  async sendVerificationOtpEmail(
    input: VerificationOtpEmailInput
  ): Promise<SentMessageInfo> {
    const rendered = this.renderVerificationOtpEmail(input);
    return this.sendMail({
      to: input.recipientEmail,
      ...rendered,
    });
  }

  private renderTemplate<Context>(
    template: TemplateDefinition<Context>,
    context: Context,
    supportEmailOverride?: string
  ): RenderedEmailTemplate {
    const layoutContext: LayoutContext = {
      previewText: template.previewText(context),
      heading: template.heading(context),
      bodyHtml: template.htmlBody(context),
      bodyText: template.textBody(context).trim(),
      actionLabel: template.actionLabel?.(context),
      actionUrl: template.actionUrl?.(context),
      supportEmail: supportEmailOverride || this.supportEmail,
      currentYear: new Date().getFullYear(),
    };

    return {
      subject: template.subject(context),
      html: baseHtmlTemplate(layoutContext),
      text: baseTextTemplate(layoutContext),
    };
  }

  private buildSigningPageUrl(email: string, contractAddress: string): string {
    const url = new URL(
      `/sign-inheritance/${encodeURIComponent(email)}`,
      this.frontendBaseUrl
    );
    url.searchParams.set('contract', contractAddress);
    return url.toString();
  }

  private buildClaimPageUrl(email: string, contractAddress: string): string {
    const url = new URL(
      `/claim-inheritance/${encodeURIComponent(email)}`,
      this.frontendBaseUrl
    );
    url.searchParams.set('contract', contractAddress);
    return url.toString();
  }

  private buildAdminDashboardUrl(contractAddress: string): string {
    const url = new URL('/admin', this.frontendBaseUrl);
    url.searchParams.set('contract', contractAddress);
    return url.toString();
  }

  private buildVerificationPageUrl(
    email: string,
    audience: VerificationAudience,
    contractAddress?: string
  ): string {
    if (audience === 'signer') {
      return contractAddress
        ? this.buildSigningPageUrl(email, contractAddress)
        : new URL(
            `/sign-inheritance/${encodeURIComponent(email)}`,
            this.frontendBaseUrl
          ).toString();
    }

    return contractAddress
      ? this.buildClaimPageUrl(email, contractAddress)
      : new URL(
          `/claim-inheritance/${encodeURIComponent(email)}`,
          this.frontendBaseUrl
        ).toString();
  }
}

export const mailerService = new MailerService();
