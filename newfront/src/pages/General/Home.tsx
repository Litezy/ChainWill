import Icon from "@/components/Icon";

const avatars = [
  {
    alt: "Professional business man portrait",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjExR6VxDOKA-dz6UginMKKQS1mA5FK-t8c1Zj-3rghpBaZB4rStE2FCqd9PukyGjlaZ_-H9vSFJ-cO3vxDjLePq1mKwVhYgOkUu-X3yUfsxGFmM9YjwRMHLTS_0Bg-bDq97-PHR3ahzI6bORSqH9yk5HS8IEfZpyAs5x6Gsv8BMFJgG20_Nqk8CGi3uZ3JoHw2CHOpDkIdZXPw1PqS7TRVYk6LqpsSXcr3utKnytvHGMmALgbwKunfS1iFe_HUuyYtMXJZqx_stIJ",
  },
  {
    alt: "Professional business woman portrait",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8oEzeJO1vl4FxHsc2x4w4PctJz3Ngs2dnZJ1dLFtxA7cDkDlBtRfU2OjF75ymw0nSnLkl_FsW2tprOBsswfloXam9deeSnT8Xkvg2piwQy9J7EPV3owCy5yAzvP3kshHAOuXZI8R6Foy0JumEGFdBjMmoHfNxGVIkGoWQW0TKFij0xQ_DAXYV2VzQFURIGoEeyNWt9xA7bNv_XaTmbEYYDo_Jgqsc9_0V3HPxCplMhye424K-gHyfHjw8t2QBksI4MySkwiNap6iV",
  },
  {
    alt: "Diverse group of professionals",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBK0ZnXCoRi06EQU_WjtREHrpVDladJpve8L1Wl_F9033NjpxOy-S4QWnUL1dAWBq_gN8EL1ioFvLJM_Iz3aKdV2bvPpUvo5p8yTuN6O1Mb8xOGjAqHiqJ8agXQAIrzCeeTeIMBTjg8RHERkcPpmhvPDLM62CxVw2GdNUw9DKzlNtnWBxUX96qbW_87T3PxvP-PJ7z2WiEIfnUx0ACcO3yBm5pp0Y3wTkgXdSGYNdlPqsyhc4dE1s0apxhuc5JbO1Wgq5P4IUhap9PL",
  },
];

const trustImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCvtYrW4esO2luS3wBAEaMaAfzFVyiSU-jp1vZNoJBr11c22av6l0fuQNtVv4P_rChGAzVKjccCQU8iDSum64Sn9puqID4Dj9Xi8zVZzKZl5WZ7bicFk4Q3KGsMRTCTCN0qYMzc5i08wzz95DLFYK5fqd62Q66q_r_6wfvAGKWv9yDpXwcyJQmdqlqyDho2yUq9irDqtiy5nydm_rXNFH4z7Sn8Li_hlLPqa9peZuob6o0WhrHyIPFCroBQ9HepE7b9CpSl2r0h8tNa";

const distributionRows = [
  { name: "Beneficiary A", pct: "75%", barClass: "w-3/4 bg-primary" },
  { name: "Beneficiary B", pct: "25%", barClass: "w-1/4 bg-primary-support" },
];

export default function Home() {
  return (
    <main className="cw-page">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="cw-section grid grid-cols-1 items-center gap-12 pb-20 pt-10 lg:grid-cols-12 lg:gap-16 lg:pt-14">

        {/* Left column */}
        <div className="space-y-8 lg:col-span-7">

          {/* Badge */}
          <div className="inline-flex items-center rounded-full bg-primary-support/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Icon className="mr-2 h-4 w-4 shrink-0" name="verifiedUser" />
            Institutional-Grade Smart Contracts
          </div>

          {/* Headline + body */}
          <div className="space-y-5">
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-primary lg:text-6xl">
              Secure Your Digital Legacy.
              <br />
              <span className="text-primary/70">On-Chain.</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-on-surface-variant">
              Automated, non-custodial inheritance. No deposits required,
              simply approve your assets via smart contract. Your testament is
              code, executed with mathematical certainty.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:flex-wrap">
            <button className="rounded-lg bg-primary px-8 py-3 text-base font-semibold text-white shadow-md transition-opacity hover:opacity-90 active:scale-95">
              Draft My Will
            </button>
            <button className="rounded-lg border border-primary-support bg-white px-8 py-3 text-base font-semibold text-primary shadow-sm transition-colors hover:bg-slate-50 active:scale-95">
              View Demo
            </button>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap items-center gap-5 pt-4">
            <div className="flex -space-x-3">
              {avatars.map((avatar) => (
                <img
                  key={avatar.src}
                  alt={avatar.alt}
                  src={avatar.src}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
                />
              ))}
            </div>
            <p className="text-sm text-on-surface-variant">
              Joined by{" "}
              <span className="font-bold text-primary">2,400+</span>{" "}
              asset holders
            </p>
          </div>
        </div>

        {/* Right column – Status card */}
        <div className="relative lg:col-span-5">
          <div className="relative z-10 rounded-3xl border border-outline-variant bg-white p-6 shadow-xl sm:p-10">

            {/* Faint lock icon – decorative bg */}
            <Icon
              className="pointer-events-none absolute right-6 top-6 h-24 w-24 text-primary/5"
              name="lock"
            />

            <div className="relative space-y-8">

              {/* Header row */}
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-support/20 text-primary">
                  <Icon className="h-6 w-6" name="wallet" />
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Current Status
                  </p>
                  <h2 className="text-xl font-bold text-primary">
                    Secured Ledger
                  </h2>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-slate-100" />

              {/* Info tiles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Asset Classes
                  </p>
                  <p className="font-bold text-primary">ERC-20, NFT</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Network
                  </p>
                  <p className="font-bold text-primary">Ethereum Mainnet</p>
                </div>
              </div>

              {/* Trigger bar */}
              <div className="flex items-center justify-between rounded-2xl bg-primary p-5 text-white shadow-md">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary-support">
                    Execution Trigger
                  </p>
                  <p className="text-sm font-bold">Signer-Attested Finality</p>
                </div>
                <Icon className="h-5 w-5 shrink-0 text-primary-support" name="bolt" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="cw-section py-16 lg:py-20">

        {/* Section heading */}
        <div className="mb-16 space-y-4 text-center">
          <h2 className="text-3xl font-bold text-primary md:text-4xl">
            The New Standard in Wealth Transfer
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-on-surface-variant">
            ChainWill removes the custodian from the inheritance equation,
            placing control firmly in the hands of the smart contract.
          </p>
        </div>

        {/* Bento grid – 3 columns on md+ */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">

          {/* ① Decentralized Authority — col-span-2 */}
          <article className="group relative min-h-[320px] overflow-hidden rounded-[32px] border border-outline-variant bg-white p-8 shadow-sm transition-colors hover:border-primary-support sm:p-10 md:col-span-2">
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-support/20 text-primary">
                  <Icon className="h-7 w-7" name="hub" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-primary">
                  Decentralized Authority
                </h3>
                <p className="max-w-md text-base leading-relaxed text-on-surface-variant">
                  No central point of failure. Your will is stored on a
                  distributed ledger, immutable and resistant to unauthorized
                  interference.
                </p>
              </div>
              <a
                href="/about"
                className="mt-8 inline-flex items-center gap-2 font-bold text-primary transition-opacity hover:opacity-80"
              >
                Learn more <Icon className="h-4 w-4" name="arrowRight" />
              </a>
            </div>
            {/* Decorative background icon */}
            <Icon
              className="pointer-events-none absolute bottom-0 right-0 h-60 w-60 text-primary/5 transition-transform duration-500 group-hover:scale-110"
              name="grid"
            />
          </article>

          {/* ② Signer-Attested — col-span-1 */}
          <article className="flex min-h-[320px] flex-col items-center justify-center rounded-[32px] border border-outline-variant bg-white p-8 text-center shadow-sm transition-colors hover:border-primary-support sm:p-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-support/20 text-primary">
              <Icon className="h-7 w-7" name="verified" />
            </div>
            <h3 className="mb-4 text-xl font-bold text-primary">
              Signer-Attested
            </h3>
            <p className="text-base leading-relaxed text-on-surface-variant">
              Human verification layer with multi-party attestation before any
              asset movement is triggered.
            </p>
          </article>

          {/* ③ Zero-Fees — col-span-1 */}
          <article className="flex min-h-[280px] flex-col items-center justify-center rounded-[32px] border border-outline-variant bg-white p-8 text-center shadow-sm transition-colors hover:border-primary-support sm:p-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-support/20 text-primary">
              <Icon className="h-7 w-7" name="savings" />
            </div>
            <h3 className="mb-4 text-xl font-bold text-primary">Zero-Fees</h3>
            <p className="text-base leading-relaxed text-on-surface-variant">
              Maintain your testament for free. Service fees are only applied
              when the execution event is confirmed.
            </p>
          </article>

          {/* ④ Granular Asset Control — col-span-2 */}
          <article className="relative min-h-[280px] overflow-hidden rounded-[32px] border border-outline-variant bg-white p-8 shadow-sm sm:p-10 md:col-span-2">
            <div className="flex h-full flex-col items-start gap-10 md:flex-row md:items-center">

              {/* Text block */}
              <div className="flex-1">
                <h3 className="mb-4 text-2xl font-bold text-primary">
                  Granular Asset Control
                </h3>
                <p className="mb-8 text-base leading-relaxed text-on-surface-variant">
                  Assign specific tokens, collections, or percentages to
                  individual beneficiaries with 100% transparency.
                </p>
                <ul className="space-y-3">
                  {["Conditional approvals", "Real-time beneficiary management"].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-3">
                        <Icon
                          className="h-5 w-5 shrink-0 text-primary"
                          name="checkCircle"
                        />
                        <span className="font-medium text-primary">{item}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              {/* Distribution widget */}
              <div className="w-full shrink-0 rounded-2xl border border-slate-100 bg-slate-50 p-6 md:w-72">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Distribution
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Active
                    </span>
                  </div>
                  {distributionRows.map(({ name, pct, barClass }) => (
                    <div key={name} className="space-y-2">
                      <div className="flex justify-between text-sm font-semibold text-primary">
                        <span>{name}</span>
                        <span>{pct}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-outline-variant">
                        <div className={`h-full rounded-full ${barClass}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ── TRUST SECTION ─────────────────────────────────────────────────── */}
      <section className="cw-section py-16 lg:py-20">
        <div className="grid grid-cols-1 items-center overflow-hidden rounded-[40px] border border-outline-variant bg-white shadow-lg lg:grid-cols-2">

          {/* Left – copy */}
          <div className="flex flex-col justify-center p-10 md:p-16 lg:p-20">
            <h2 className="mb-6 text-3xl font-bold text-primary md:text-4xl">
              Designed for Technical Finality
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-on-surface-variant">
              We combine the rigorous logic of blockchain with the formalities
              of traditional law to ensure your legacy transitions seamlessly.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-4xl font-black text-primary">0%</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Custodial Risk
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-black text-primary">256-bit</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Encryption
                </p>
              </div>
            </div>
          </div>

          {/* Right – image */}
          <div className="relative min-h-[360px] lg:min-h-[460px]">
            <img
              src={trustImage}
              alt="Abstract high-tech digital secure networking visualization"
              className="object-cover"
            
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </div>
      </section>
    </main>
  );
}