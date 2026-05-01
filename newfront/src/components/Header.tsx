import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { connectWalletSimulation, disconnectWalletSimulation, isWalletConnected } from '@/middleware/auth';

export default function Header() {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    setWalletConnected(isWalletConnected());
  }, []);

  const handleWallet = () => {
    if (walletConnected) {
      disconnectWalletSimulation();
      navigate('/');
      window.location.reload();
      return;
    }

    connectWalletSimulation();
    navigate('/auth/overview');
    window.location.reload();
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'How It Works', href: '/how-it-works' },
  ];

  return (
    <header className="fixed z-50 w-full border-b border-slate-200 bg-slate-50/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link className="text-xl font-semibold tracking-tight text-indigo-950" to="/">
          ChainWill
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`transition-colors ${
                  isActive
                    ? 'border-b-2 border-indigo-700 text-indigo-700'
                    : 'hover:text-indigo-700'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <button
          onClick={handleWallet}
          type="button"
          className="rounded-xl bg-indigo-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800"
        >
          {walletConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
        </button>
      </nav>
    </header>
  );
}
