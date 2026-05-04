"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertDispatcher = exports.AlertDispatcherService = void 0;
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
    webhookUrl = process.env.ALERT_WEBHOOK_URL;
    webhookToken = process.env.ALERT_WEBHOOK_BEARER_TOKEN;
    emailOverrides = parseEmailOverrides();
    resolveRecipientEmail(input) {
        const normalizedAddress = input.address.toLowerCase();
        if (input.email) {
            return input.email;
        }
        return this.emailOverrides[normalizedAddress] ?? null;
    }
    async sendAttestationOpenAlert(input) {
        await this.dispatchEmail({
            category: 'attestation-open',
            subject: 'Attestation Open',
            to: input.recipients,
            text: [
                `Attestation is now open for will ${input.willId}.`,
                `Contract address: ${input.contractAddress}.`,
                'Please review and act if attestation is required.',
            ].join('\n'),
            metadata: {
                willId: input.willId,
                contractAddress: input.contractAddress,
            },
        });
    }
    async sendFundingRiskAlert(input) {
        await this.dispatchEmail({
            category: 'funding-risk',
            subject: 'Funding Risk Alert',
            to: input.recipient,
            text: [
                `Funding risk detected for will ${input.willId}.`,
                `Contract address: ${input.contractAddress}.`,
                `Approved amount: ${input.approvedAmount}.`,
                `Owner balance: ${input.ownerBalance}.`,
                `Reason: ${input.reasons.join(', ')}.`,
            ].join('\n'),
            metadata: {
                willId: input.willId,
                contractAddress: input.contractAddress,
                approvedAmount: input.approvedAmount,
                ownerBalance: input.ownerBalance,
                reasons: input.reasons,
            },
        });
    }
    async dispatchEmail(payload) {
        if (payload.to.length === 0) {
            console.warn(`[AlertDispatcher] Skipping ${payload.category} alert because no recipients were resolved`);
            return;
        }
        if (!this.webhookUrl) {
            console.log(`[AlertDispatcher] ${payload.category} alert prepared for ${payload.to.join(', ')}`);
            console.log(payload.text);
            return;
        }
        const response = await fetch(this.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.webhookToken
                    ? { Authorization: `Bearer ${this.webhookToken}` }
                    : {}),
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(`Alert webhook failed with ${response.status} ${response.statusText}`);
        }
    }
}
exports.AlertDispatcherService = AlertDispatcherService;
exports.alertDispatcher = new AlertDispatcherService();
