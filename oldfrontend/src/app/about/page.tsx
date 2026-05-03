import Icon from "@/components/Icon";

/* ── Data ─────────────────────────────────────────────────────────────────── */

const protocolPoints = [
  "Non-custodial by design",
  "Immutable execution",
  "Multi-asset support",
] as const;

type FeatureCard = {
  icon: "verifiedUser" | "code" | "hub";
  title: string;
  description: string;
  action?: string;
  actionIcon?: "openInNew" | "terminal";
};

const featureCards: FeatureCard[] = [
  {
    icon: "verifiedUser",
    title: "Audited Code",
    description:
      "Our smart contracts have undergone rigorous third-party audits by leading firms to ensure zero-vulnerability execution.",
    action: "VIEW REPORT",
    actionIcon: "openInNew",
  },
  {
    icon: "code",
    title: "Open Source",
    description:
      "Finality requires transparency. The ChainWill protocol is fully open-source, allowing the community to verify every line of logic.",
    action: "GITHUB REPO",
    actionIcon: "terminal",
  },
  {
    icon: "hub",
    title: "Decentralized",
    description:
      "No central point of failure. Your digital testament exists on-chain, independent of our company's future existence.",
  },
];

/* ── Component ────────────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <main className="cw-container cw-page">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto mb-24 max-w-4xl pt-6 text-center">
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary md:text-5xl">
          Securing the Legacy of the Digital Age
        </h1>
        <p className="mx-auto max-w-3xl text-lg leading-relaxed text-on-surface-variant">
          As the world transitions to a digital-first economy, billions of
          dollars in assets are lost forever every year due to human mortality
          and the permanence of blockchain. ChainWill is the digital notary for
          the 21st century, ensuring your digital testament is executed exactly
          as you intended, without reliance on intermediaries.
        </p>
      </section>

      {/* ── CRISIS / PROTOCOL ─────────────────────────────────────────────── */}
      <section className="mb-32 grid grid-cols-1 gap-12 md:grid-cols-2">

        {/* Crisis card */}
        <article className="flex flex-col justify-center rounded-2xl border border-gray-100 bg-white p-10 shadow-sm">
          <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-red-600">
            The Crisis
          </span>
          <h2 className="mb-6 text-4xl font-bold text-primary">
            $140 Billion Lost
          </h2>
          <p className="mb-8 leading-relaxed text-on-surface-variant">
            An estimated 20% of all Bitcoin is trapped in inaccessible wallets.
            When asset holders pass away without a clear inheritance mechanism,
            their digital legacy vanishes. Traditional legal systems are too
            slow, too manual, and often technologically incapable of handling
            smart-contract-based assets.
          </p>
          <div className="flex items-center gap-4">
            <div className="h-1 w-16 rounded-full bg-red-600" />
            <span className="text-sm font-semibold text-red-600">
              Critical System Failure
            </span>
          </div>
        </article>

        {/* Protocol card */}
        <article className="flex flex-col justify-center rounded-2xl bg-primary p-10 text-white shadow-xl">
          <Icon className="mb-6 h-10 w-10 text-secondary" name="gavel" />
          <h2 className="mb-6 text-3xl font-bold">The ChainWill Protocol</h2>
          <p className="mb-10 leading-relaxed text-gray-200">
            We provide a decentralized framework for conditional token
            approvals. By leveraging time-locked smart contracts and
            &quot;I&apos;m Alive&quot; heartbeat checks, ChainWill automates
            the transfer of ownership to your designated beneficiaries.
          </p>
          <ul className="space-y-4">
            {protocolPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <Icon
                  className="mt-0.5 h-5 w-5 shrink-0 text-secondary"
                  name="checkCircle"
                />
                <span className="font-medium">{point}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* ── FEATURE CARDS ─────────────────────────────────────────────────── */}
      <section className="mb-32 grid grid-cols-1 gap-8 md:grid-cols-3">
        {featureCards.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
          >
            <Icon
              className="mb-4 h-8 w-8 text-primary"
              name={feature.icon}
            />
            <h3 className="mb-3 text-xl font-bold text-primary">
              {feature.title}
            </h3>
            <p className="mb-6 leading-relaxed text-on-surface-variant">
              {feature.description}
            </p>

            {/* Action / decorative icons */}
            {feature.action && feature.actionIcon ? (
              <a
                href="#"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-secondary"
              >
                {feature.action}
                <Icon className="h-4 w-4" name={feature.actionIcon} />
              </a>
            ) : (
              <div className="flex -space-x-2">
                {(["lan", "link"] as const).map((iconName) => (
                  <div
                    key={iconName}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-surface-variant text-primary"
                  >
                    <Icon className="h-3.5 w-3.5" name={iconName} />
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-between gap-10 rounded-3xl border border-blue-100 bg-blue-50 p-12 md:flex-row md:p-16">
        <div className="max-w-xl text-center md:text-left">
          <h2 className="mb-4 text-3xl font-bold text-primary">
            Ready to secure your legacy?
          </h2>
          <p className="text-lg text-on-surface-variant">
            Join thousands of proactive asset holders who have already drafted
            their digital testament.
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 sm:w-auto sm:flex-row">
          <button className="rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90">
            START DRAFTING
          </button>
          <button className="rounded-xl border border-gray-200 bg-white px-8 py-4 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-gray-50">
            READ DOCUMENTATION
          </button>
        </div>
      </section>
    </main>
  );
}