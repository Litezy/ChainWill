import React, { type ReactNode } from 'react';
import { useAccount, useConnect } from 'wagmi';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const handleConnectWallet = () => {
    const connector =
      connectors.find((connector) => connector.id === 'metaMask' && connector.ready) ||
      connectors.find((connector) => connector.ready) ||
      connectors[0];

    if (!connector) return;
    connect({ connector });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
        <div className="max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-semibold text-slate-950 mb-4">Wallet Not Connected</h1>
          <p className="text-sm text-slate-600 mb-6">
            Please connect your wallet to access the dashboard.
          </p>
          <button
            type="button"
            onClick={handleConnectWallet}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-indigo-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-800"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;