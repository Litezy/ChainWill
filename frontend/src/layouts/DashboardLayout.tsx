import React, { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar, { dashboardNavItems } from '@/components/dashboard/Sidebar';
import CreateNewWill from '@/pages/General/CreateNewWill';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [createWillOpen, setCreateWillOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar onDraftNewWill={() => setCreateWillOpen(true)} />

      <div className="lg:ml-[18%]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-100/95 px-4 py-3 backdrop-blur-sm lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <Link to="/auth/overview" className="text-base font-semibold text-slate-950">
              Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCreateWillOpen(true)}
                className="rounded-full bg-primary px-4 py-1.5 !text-xs font-semibold text-white transition hover:bg-primary/90"
              >
                Draft Will
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-950 shadow-sm"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {menuOpen ? (
            <nav className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <ul className="space-y-2">
                {dashboardNavItems.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-3xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-primary/10 hover:text-primary"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </header>

        <main className="min-h-screen overflow-y-auto  py-4 md:px-4 md:py-6">{children}</main>
      </div>

      {createWillOpen && <CreateNewWill onClose={() => setCreateWillOpen(false)} />}
    </div>
  );
};

export default DashboardLayout;
