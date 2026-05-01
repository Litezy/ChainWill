import { FileText, Gavel, ShieldCheck, ScrollText } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-background text-on-surface">
      <header className="border-b border-outline-variant/60 bg-surface-container-lowest/90 backdrop-blur">
        <div className="cw-container flex h-[70px] items-center justify-between">
          <h1 className="text-[20px] font-extrabold text-primary">ChainWill</h1>

          <nav className="hidden items-center gap-10 text-nav-item text-on-surface-variant md:flex">
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/how-it-works">How It Works</a>
          </nav>

          <button className="rounded-[10px] bg-primary px-6 py-3 text-sm font-bold text-on-primary transition hover:bg-primary-container">
            Connect Wallet
          </button>
        </div>
      </header>

      <section className="cw-page">
        <div className="mx-auto mb-14 max-w-[760px] text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1 text-label-bold font-extrabold uppercase tracking-[0.12em] text-primary">
            <Gavel size={14} />
            Legal Framework
          </div>

          <h2 className="mb-6 text-display-lg font-bold text-primary">
            Terms & Conditions
          </h2>

          <p className="mx-auto max-w-[680px] text-body-base font-medium text-on-surface-variant">
            Please read these terms carefully. They govern your use of the
            ChainWill digital notary protocol and inheritance management
            services.
          </p>

          <p className="mt-8 text-sm font-bold uppercase tracking-wide text-outline">
            Last Updated: October 24, 2024
          </p>
        </div>

        <div className="mx-auto max-w-[900px] overflow-hidden rounded-xl border border-outline-variant/80 bg-surface-container-lowest shadow-sm">
          <div className="space-y-12 px-12 py-12 md:px-14">
            <TermBlock number="1" title="Agreement to Terms">
              By accessing or using the ChainWill platform, you agree to be
              bound by these Terms and Conditions. These terms constitute a
              legally binding agreement between you and ChainWill Protocol. If
              you do not agree to these terms, you must immediately cease all
              use of the platform.
            </TermBlock>

            <TermBlock number="2" title="Protocol Usage & Smart Contracts">
              <p>
                ChainWill operates as a decentralized interface for smart
                contracts. When you "Execute Testament" or "Confirm Approval,"
                you are interacting directly with the blockchain.
              </p>

              <ul className="mt-5 space-y-4 pl-6">
                <li>
                  The platform does not hold custody of your private keys.
                </li>
                <li>
                  Digital assets remain under your control until the predefined
                  conditions in your Digital Testament are met.
                </li>
                <li>
                  Users are responsible for ensuring the accuracy of beneficiary
                  wallet addresses.
                </li>
              </ul>
            </TermBlock>

            <div>
              <SectionTitle number="3" title="Financial Advice Disclaimer" />

              <div className="mt-5 flex gap-5 rounded-lg border border-orange-200 bg-orange-50 px-6 py-6 text-[#8a3b1c]">
                <Gavel className="mt-1 shrink-0" size={22} />
                <div>
                  <h4 className="mb-3 font-extrabold text-[#6f2d16]">
                    Notice to All Users:
                  </h4>
                  <p className="text-body-sm leading-[1.75]">
                    ChainWill provides technical infrastructure for digital
                    asset management. We are not a financial advisor, law firm,
                    or fiduciary. The information provided on this platform does
                    not constitute legal, financial, or investment advice. We
                    recommend consulting with professional legal counsel
                    regarding inheritance laws in your jurisdiction.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <SectionTitle number="4" title="Platform Fees" />

              <div className="mt-5 grid gap-7 md:grid-cols-2">
                <div>
                  <p className="mb-5 text-body-base leading-[1.65] text-on-surface-variant">
                    ChainWill sustains its secure infrastructure through a
                    transparent fee model applied to executed digital
                    testaments.
                  </p>

                  <div className="rounded-lg border border-outline-variant bg-surface-container p-5">
                    <div className="mb-3 flex items-center justify-between font-bold text-on-surface-variant">
                      <span>Protocol Service Fee</span>
                      <span className="text-primary">0.5%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-primary-fixed-dim">
                      <div className="h-full w-full rounded-full bg-on-primary-container" />
                    </div>

                    <p className="mt-3 text-[11px] font-medium text-outline">
                      Applied only at the time of final asset distribution.
                    </p>
                  </div>
                </div>

                <div className="flex items-center rounded-lg border border-outline-variant/70 bg-surface-container-low px-7 py-6">
                  <p className="text-sm font-semibold italic leading-[1.55] text-on-surface-variant">
                    "The 0.5% fee ensures continuous maintenance of the
                    monitoring nodes that verify the 'I'm Alive' check-ins and
                    trigger the smart contract execution."
                  </p>
                </div>
              </div>
            </div>

            <TermBlock number="5" title="Risk Acknowledgement">
              You acknowledge that blockchain technology is subject to inherent
              risks, including but not limited to smart contract
              vulnerabilities, network congestion, and regulatory changes.
              ChainWill is not liable for losses resulting from user error or
              network-level failures.
            </TermBlock>
          </div>

          <div className="flex flex-col gap-6 bg-primary px-8 py-8 text-on-primary md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="mb-1 text-lg font-semibold">
                Acceptance of Agreement
              </h3>
              <p className="text-sm text-primary-fixed-dim">
                By using the dashboard, you confirm your consent to these terms.
              </p>
            </div>

            <button className="rounded-lg bg-white px-7 py-4 text-sm font-extrabold text-primary transition hover:bg-primary-fixed">
              Accept Terms
            </button>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-[900px] gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<ShieldCheck size={24} />}
            title="Immutable Code"
            text="Audited smart contracts ensure your legacy is executed exactly as defined."
          />
          <FeatureCard
            icon={<ShieldCheck size={24} />}
            title="Self-Custodial"
            text="No centralized entity ever has access to your assets or private keys."
          />
          <FeatureCard
            icon={<FileText size={24} />}
            title="Transparent Fees"
            text="Zero hidden charges. A fixed 0.5% fee maintains the notary network."
          />
        </div>
      </section>

      <footer className="border-t border-outline-variant/60 bg-surface-container-lowest">
        <div className="cw-container flex flex-col gap-5 py-9 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-[18px] font-extrabold text-primary">
              ChainWill
            </h2>
            <p className="text-xs text-on-surface-variant">
              © 2024 ChainWill. Secured by Smart Contracts.
            </p>
          </div>

          <div className="flex gap-8 text-xs text-on-surface-variant">
            <a className="underline underline-offset-4" href="/privacy-policy">
              Privacy Policy
            </a>
            <a
              className="underline underline-offset-4"
              href="/terms-and-conditions"
            >
              Terms & Conditions
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-4 text-primary">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-fixed text-xl font-bold">
        {number}
      </span>
      <h3 className="text-headline-md font-bold">{title}</h3>
    </div>
  );
}

function TermBlock({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <SectionTitle number={number} title={title} />
      <div className="mt-5 text-body-base font-medium leading-[1.65] text-on-surface-variant">
        {children}
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-outline-variant/80 bg-surface-container-lowest px-8 py-8 text-center shadow-sm">
      <div className="mb-4 flex justify-center text-primary">{icon}</div>
      <h3 className="mb-3 text-base font-bold text-primary">{title}</h3>
      <p className="text-xs leading-[1.5] text-on-surface-variant">{text}</p>
    </div>
  );
}
