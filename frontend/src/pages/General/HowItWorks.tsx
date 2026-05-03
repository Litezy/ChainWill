import Icon from "@/components/Icon";

const steps = [
  {
    icon: "factory" as const,
    step: "Step 01",
    title: "Create Will",
    description:
      'Deploy your unique digital notary contract directly to the blockchain. This "Factory Deployment" establishes your sovereign space for legacy management without third-party custodians.',
    content: (
      <div className="mt-auto flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container p-3">
        <Icon className="h-4 w-4 text-primary" name="terminal" />
        <code className="truncate font-mono text-xs text-primary">
          contract_deploy --init chainwill
        </code>
      </div>
    ),
  },
  {
    icon: "token" as const,
    step: "Step 02",
    title: "Approve Tokens",
    description:
      "Assets never leave your wallet. You simply grant the protocol permission to transfer them only when the finality trigger is confirmed.",
    content: (
      <ul className="mt-auto space-y-3">
        {["ETH / WETH", "USDC / USDT"].map((asset) => (
          <li
            className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container p-3"
            key={asset}
          >
            <span className="text-sm font-medium text-primary">{asset}</span>
            <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
              Approved
            </span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: "group" as const,
    step: "Step 03",
    title: "Assign Entities",
    description:
      "Define the trusted signers who verify your status and the beneficiaries who will receive your legacy.",
    content: (
      <div className="mt-auto space-y-3">
        {[
          ["JD", "John Doe", "Signer", "bg-primary text-on-primary"],
          ["AM", "Alice Miller", "Beneficiary", "bg-secondary-container text-on-secondary-container"],
        ].map(([initials, name, role, tone]) => (
          <div
            className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container p-3"
            key={name}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${tone}`}
            >
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">{name}</p>
              <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">
                {role}
              </p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: "history" as const,
    step: "Step 04",
    title: "Regular Check-in",
    description:
      "The heartbeat of your testament. Periodically interact with the dashboard or send a transaction to reset the inactivity timer.",
    content: (
      <div className="mt-auto space-y-4 rounded-lg border border-outline-variant bg-surface-container p-4">
        <div className="mb-1 flex items-end justify-between">
          <span className="text-xs font-semibold text-primary">
            Inactivity Timer
          </span>
          <span className="text-xs font-bold text-primary">85%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-outline-variant">
          <div className="h-full w-[85%] bg-primary" />
        </div>
        <button className="w-full rounded-md border border-primary bg-white py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-white">
          I&apos;m Alive Check-in
        </button>
      </div>
    ),
  },
  {
    icon: "notification" as const,
    step: "Step 05",
    title: "Protocol Trigger",
    description:
      "Triggered by either a total lapse in inactivity or a multi-signature attestation from your designated signers.",
    content: (
      <div className="mt-auto grid grid-cols-2 gap-3">
        {[
          ["timer", "90-Day Silent", "Auto activation"],
          ["rule", "2/3 Signers", "Attestation met"],
        ].map(([icon, title, copy]) => (
          <div
            className="rounded-lg border border-outline-variant bg-surface-container p-3"
            key={title}
          >
            <Icon className="mb-1 h-4 w-4 text-primary" name={icon as "timer" | "rule"} />
            <p className="text-xs font-bold text-primary">{title}</p>
            <p className="text-[10px] text-on-surface-variant">{copy}</p>
          </div>
        ))}
      </div>
    ),
  },
];

const securityFeatures = [
  {
    icon: "verifiedUser" as const,
    title: "Non-Custodial",
    description:
      "Your assets remain in your wallet. We never hold your keys or your tokens.",
  },
  {
    icon: "codeOff" as const,
    title: "Audited Logic",
    description:
      "Our factory contracts are rigorously audited to ensure logic cannot be tampered with.",
  },
  {
    icon: "lockReset" as const,
    title: "Self-Sovereign",
    description:
      "Cancel, edit, or revoke approvals at any time with a single transaction.",
  },
];

export default function HowItWorks() {
  return (
    <main className="cw-container cw-page">
      <section className="mb-24 pt-6 text-center">
        <h1 className="mb-6 text-display-lg tracking-tight text-primary">
          The Protocol of Finality
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-body-base leading-relaxed text-on-surface-variant">
          A formal, secure, and fully automated legal process for your digital
          testament. Secured by smart contracts, governed by your intent.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button className="rounded-lg bg-primary px-8 py-3.5 font-semibold text-on-primary shadow-md transition hover:opacity-90">
            Execute Testament
          </button>
          <button className="rounded-lg bg-secondary-fixed px-8 py-3.5 font-semibold text-on-secondary-fixed transition hover:bg-secondary-container">
            View Demo
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((item) => (
          <article
            className="flex min-h-[420px] flex-col rounded-xl border border-outline-variant bg-white p-8 shadow-sm"
            key={item.step}
          >
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-container/30 text-primary">
              <Icon className="h-5 w-5" name={item.icon} />
            </div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-secondary">
              {item.step}
            </span>
            <h3 className="mb-4 text-xl font-bold text-primary">
              {item.title}
            </h3>
            <p className="mb-6 flex-grow text-sm leading-relaxed text-on-surface-variant">
              {item.description}
            </p>
            {item.content}
          </article>
        ))}

        <article className="flex min-h-[420px] flex-col rounded-xl border border-primary bg-primary p-8 text-on-primary shadow-md">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white">
            <Icon className="h-5 w-5" name="sendArchive" />
          </div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-secondary-fixed">
            Step 06
          </span>
          <h3 className="mb-4 text-xl font-bold">Automatic Distribution</h3>
          <p className="mb-6 flex-grow text-sm leading-relaxed text-secondary-fixed">
            Finality reached. The smart contract executes the pre-approved token
            approvals, distributing assets instantly to your beneficiaries&apos;
            wallets.
          </p>
          <div className="mt-auto rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-secondary-fixed">
                Protocol Status:
              </span>
              <span className="rounded-md border border-green-400/30 bg-green-400/20 px-2 py-0.5 text-xs font-bold text-green-300">
                EXECUTED
              </span>
            </div>
            <p className="truncate font-mono text-[10px] text-secondary-fixed">
              Tx: 0x71C765...d8976f
            </p>
          </div>
        </article>
      </section>

      <section className="mx-auto mb-16 mt-32 max-w-4xl text-center">
        <h2 className="mb-12 text-3xl font-bold text-primary">
          Institutional Grade Security
        </h2>
        <div className="grid gap-12 md:grid-cols-3">
          {securityFeatures.map((feature) => (
            <article key={feature.title}>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container">
                <Icon className="h-8 w-8 text-primary" name={feature.icon} />
              </div>
              <h3 className="mb-3 text-lg font-bold text-primary">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
