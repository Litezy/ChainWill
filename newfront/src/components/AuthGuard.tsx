import React, { type ReactNode, useEffect, useState } from 'react';
import { connectWalletSimulation, isWalletConnected } from '@/middleware/auth';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [loaded, setLoaded] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    setWalletConnected(isWalletConnected());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return null;
  }

  if (!walletConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
        <div className="max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-semibold text-slate-950 mb-4">Wallet Not Connected</h1>
          <p className="text-sm text-slate-600 mb-6">
            Please connect your wallet to access the dashboard. This is a simulated auth check until your wallet library is installed.
          </p>
          <button
            onClick={() => {
              connectWalletSimulation();
              window.location.reload();
            }}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-indigo-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-800"
          >
            Connect Wallet (Simulation)
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;