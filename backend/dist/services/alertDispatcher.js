"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertDispatcher = exports.AlertDispatcherService = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function escapeHtml(input) {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function renderHtmlBody(lines) {
    return [
        '<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">',
        ...lines.map((line) => `<p>${escapeHtml(line)}</p>`),
        '</div>',
    ].join('');
}
function parseEmailOverrides() {
    const raw = process.env.ALERT_EMAIL_OVERRIDES;
    if (!raw) {
        return {};
    }
    try {
        const parsed = JSON.parse(raw);
        return Object.fromEntries(Object.entries(parsed).map(([address, email]) => [
            address.toLowerCase(),
            email,
        ]));
    }
    catch (error) {
        console.error('[AlertDispatcher] Failed to parse ALERT_EMAIL_OVERRIDES:', error instanceof Error ? error.message : error);
        return {};
    }
}
class AlertDispatcherService {
    resendApiKey = process.env.RESEND_API_KEY;
    emailFrom = process.env.ALERT_EMAIL_FROM || 'ChainWill <onboarding@resend.dev>';
    emailReplyTo = process.env.ALERT_EMAIL_REPLY_TO;
    emailOverrides = parseEmailOverrides();
    resolveRecipientEmail(input) {
        const normalizedAddress = input.address.toLowerCase();
        if (input.email) {
            return input.email;
        }
        return this.emailOverrides[normalizedAddress] ?? null;
    }
    buildEmailPayload(job) {
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
    async sendAlertEmail(payload) {
        if (payload.to.length === 0) {
            console.warn(`[AlertDispatcher] Skipping ${payload.category} alert because no recipients were resolved`);
            return;
        }
        if (!this.resendApiKey) {
            console.log(`[AlertDispatcher] ${payload.category} alert prepared for ${payload.to.join(', ')}`);
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
            throw new Error(`Resend request failed with ${response.status} ${response.statusText}: ${body}`);
        }
    }
}
exports.AlertDispatcherService = AlertDispatcherService;
exports.alertDispatcher = new AlertDispatcherService();
