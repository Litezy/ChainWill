import { Database, LockKeyhole, ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-on-surface">
      <section className="cw-page">
        <div className="mx-auto max-w-[900px] rounded-2xl border border-outline-variant/70 bg-surface-container-lowest px-12 py-12 shadow-sm md:px-20 md:py-14">
          <div className="mb-14 text-center">
            <p className="mb-5 text-label-bold font-bold uppercase tracking-[0.25em] text-primary">
              Legal Framework
            </p>

            <h1 className="mb-6 text-display-lg font-bold text-primary">
              Privacy Policy
            </h1>

            <p className="mx-auto max-w-[720px] text-body-base text-on-surface-variant">
              Last Updated: June 14, 2024. Your privacy in the decentralized
              world is our highest priority. This policy outlines how ChainWill
              manages data within our smart contract ecosystem.
            </p>
          </div>

          <PolicySection icon={<Database size={22} />} title="Data Collection">
            <p>
              ChainWill operates on a principle of{" "}
              <strong>minimal data persistence.</strong> We do not collect
              traditional personally identifiable information (PII) such as your
              legal name, physical address, or phone number unless voluntarily
              provided for off-chain notifications.
            </p>

            <div className="mt-6 space-y-4 pl-5 font-semibold">
              <p>
                Public Ledger Data: Transactions, wallet addresses, and smart
                contract interactions are recorded on the public blockchain.
              </p>
              <p>
                Metadata: Temporary session data used to facilitate interface
                performance and security.
              </p>
              <p>
                Encrypted Payload: Metadata regarding your Digital Testament is
                stored in an encrypted state, accessible only via your private
                keys.
              </p>
            </div>
          </PolicySection>

          <PolicySection icon={<LockKeyhole size={22} />} title="Cryptography">
            <p>
              As a Digital Notary, our security model relies on
              industry-standard cryptographic primitives. Your digital assets
              are governed by self-executing smart contracts.
            </p>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <InfoCard
                title="End-to-End Encryption"
                text="All sensitive beneficiary metadata is encrypted client-side before reaching any distributed storage layer."
              />
              <InfoCard
                title="Zero-Knowledge Proofs"
                text='We utilize ZK-logic to verify identity "check-ins" without exposing the underlying user activity.'
              />
            </div>
          </PolicySection>

          <PolicySection
            icon={<ShieldCheck size={22} />}
            title="Third-Party Risks"
            isLast
          >
            <p>
              Interaction with the ChainWill protocol involves third-party
              dependencies. Users must acknowledge the following inherent risks:
            </p>

            <div className="mt-6 space-y-4 pl-5 font-semibold">
              <p>
                Network Congestion: Privacy during high-traffic periods may be
                affected by public mempool transparency.
              </p>
              <p>
                Oracle Integrity: Data feeds used for "I'm Alive" checks are
                subject to the security of their respective decentralized oracle
                networks.
              </p>
              <p>
                Wallet Providers: Your choice of wallet provider, e.g.,
                MetaMask, Ledger, maintains its own privacy policies independent
                of ChainWill.
              </p>
            </div>
          </PolicySection>

          <div className="mt-14 grid gap-8 border-t border-outline-variant/60 pt-7 md:grid-cols-3">
            <FooterInfo
              title="Your Rights"
              text="Due to the immutable nature of the blockchain, certain data cannot be deleted. You have the right to revoke all active Token Approvals at any time."
            />
            <FooterInfo
              title="Governance"
              text="Changes to this policy are proposed through the community governance protocol and require a 72-hour review period before implementation."
            />
            <FooterInfo
              title="Contact"
              text="For legal inquiries regarding the protocol's compliance, please contact our legal counsel at legal@chainwill.io or via the On-chain DAO forum."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

type PolicySectionProps = {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  isLast?: boolean;
};

function PolicySection({ icon, title, children, isLast }: PolicySectionProps) {
  return (
    <section className={isLast ? "" : "mb-12"}>
      <div className="mb-5 flex items-center gap-3 border-b border-outline-variant/60 pb-3 text-primary">
        {icon}
        <h2 className="text-headline-md font-bold">{title}</h2>
      </div>

      <div className="pl-9 text-body-base leading-[1.75] text-on-surface-variant">
        {children}
      </div>
    </section>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-6">
      <h3 className="mb-3 text-label-bold font-extrabold uppercase tracking-[0.12em] text-primary">
        {title}
      </h3>
      <p className="text-body-sm text-on-surface-variant">{text}</p>
    </div>
  );
}

function FooterInfo({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="mb-3 text-label-bold font-extrabold uppercase tracking-[0.12em] text-primary">
        {title}
      </h3>
      <p className="text-body-sm text-on-surface-variant">{text}</p>
    </div>
  );
}
