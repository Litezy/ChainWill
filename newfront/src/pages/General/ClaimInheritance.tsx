import React from 'react';

const ClaimInheritance: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center px-gutter py-12">
        <div className="w-full max-w-2xl mx-auto">
          {/* Main Claim Card */}
          <div className="glass-card border border-slate-200 rounded-xl shadow-[0_20px_50px_rgba(2,16,100,0.04)] overflow-hidden">
            {/* Hero Section for the Card */}
            <div className="relative h-48 bg-primary-container overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-20">
                <img
                  alt="Blockchain visualization"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5W2ZNBszsuRqTfG7Djx_6NZmxSPcq3WoyrL_V19pfUBXNoflFYI6YhWjUf0fMKzclSGMXWNcYU63CutCQxpcB7MXZPAjzeGqg-IZm4hXbAS0O0IujQrJH-TvL0jId7vvm4Q5lQppafnZcGLEqOaLFKhU3SqPMjIR3wRhY5NPR9VKH_qLEFFPIP--JUVpdmOfyX4ppnb7JqLqfwmMY0td1UnYwXCp8iAvS6dZrhQlNeN-vEkIzuVcaYQMP_bAO7vSuiBEmfO1K61W_"
                />
              </div>
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-on-primary mb-4 shadow-lg">
                  <span
                    className="material-symbols-outlined text-primary text-4xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    lock_open
                  </span>
                </div>
                <div className="bg-green-500/10 text-[#4ade80] px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border border-[#4ade80]/30 backdrop-blur-sm">
                  Status: Triggered
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12 text-center">
              <h1 className="font-display-lg text-display-lg text-primary mb-4">
                Claim Your Inheritance
              </h1>
              <p className="font-body-base text-on-surface-variant max-w-md mx-auto mb-8">
                The Digital Notary has confirmed the trigger conditions for the following testament.
              </p>

              {/* Details Box */}
              <div className="bg-surface-container-low rounded-xl p-6 mb-8 border border-outline-variant/30">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                    <span className="font-label-bold text-label-bold text-outline uppercase">
                      From Testator
                    </span>
                    <span className="font-nav-item text-nav-item text-primary font-bold">
                      0x3d...f9a1 (Alex Thompson)
                    </span>
                  </div>

                  <div className="py-4">
                    <span className="font-label-bold text-label-bold text-outline uppercase block mb-2">
                      Claimable Amount
                    </span>
                    <div className="font-display-lg text-display-lg text-primary flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-3xl">monetization_on</span>
                      24,500.00 USDC
                    </div>
                    <p className="font-body-sm text-body-sm text-outline mt-2">
                      Includes 0.5% protocol maintenance fee deduction.
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-t border-outline-variant/20 pt-4">
                    <span className="font-label-bold text-label-bold text-outline uppercase">
                      Network Context
                    </span>
                    <div className="flex items-center gap-2 text-on-surface font-medium">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      Sepolia Testnet
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="flex flex-col gap-4">
                <button className="w-full bg-primary text-on-primary py-5 rounded-lg font-headline-md text-headline-md shadow-lg hover:bg-primary-container transition-all active:opacity-80 active:scale-95 flex items-center justify-center gap-3">
                  Claim Inheritance
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <p className="font-body-sm text-body-sm text-outline flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  Secured by smart contract execution. All actions are final.
                </p>
              </div>
            </div>

            {/* Footer-like Info within card */}
            <div className="px-8 py-4 bg-surface-container-highest/50 border-t border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline text-lg">history</span>
                <span className="font-label-bold text-label-bold text-outline uppercase">
                  Event Triggered: 2 hours ago
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline text-lg">account_tree</span>
                <span className="font-label-bold text-label-bold text-outline uppercase">
                  ID: DT-928-XA
                </span>
              </div>
            </div>
          </div>

          {/* Supporting Assistance Links */}
          {/* <div className="mt-8 flex justify-center gap-8 text-outline">
            <a
              className="font-label-bold text-label-bold hover:text-primary transition-colors flex items-center gap-1"
              href="#"
            >
              <span className="material-symbols-outlined text-sm">help</span>
              How it works
            </a>
            <a
              className="font-label-bold text-label-bold hover:text-primary transition-colors flex items-center gap-1"
              href="#"
            >
              <span className="material-symbols-outlined text-sm">description</span>
              Audit Report
            </a>
            <a
              className="font-label-bold text-label-bold hover:text-primary transition-colors flex items-center gap-1"
              href="#"
            >
              <span className="material-symbols-outlined text-sm">support_agent</span>
              Get Support
            </a>
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default ClaimInheritance;
