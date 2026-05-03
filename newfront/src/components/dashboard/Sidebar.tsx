import { LayoutGrid, Users, UserCheck, Settings, Wallet, Plus } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const dashboardNavItems = [
  { label: 'Overview', icon: LayoutGrid, to: '/auth/overview' },
  { label: 'Assets', icon: Wallet, to: '/auth/assets' },
  { label: 'Beneficiaries', icon: Users, to: '/auth/beneficiaries' },
  { label: 'Signers', icon: UserCheck, to: '/auth/signers' },
  { label: 'Settings', icon: Settings, to: '/auth/settings' },
];

interface SidebarProps {
  onDraftNewWill?: () => void;
}

export default function Sidebar({ onDraftNewWill }: SidebarProps) {
  return (
    <aside className="hidden lg:flex fixed top-0 left-0 z-20 h-screen w-[20%] min-w-[280px] flex-col justify-between border-r border-slate-200 bg-slate-50 px-6 py-4">
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-primary">ChainWill</h1>
          <p className="text-xs text-slate-500">Digital Notary</p>
        </div>

        <nav>
          <ul className="space-y-2">
            {dashboardNavItems.map(({ label, icon: Icon, to }) => {
              const commonClasses =
                'flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition-colors';

              return (
                <li key={label}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `${commonClasses} ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[13px]">{label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="space-y-3 mb-4">
        <button
          type="button"
          onClick={onDraftNewWill}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-primary px-3 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          <Plus size={14} className="text-white" />
          Draft New Will
        </button>

        <div className="flex items-center gap-4 rounded-[28px] bg-white px-3 py-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            CW
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">ox72...9E41</p>
            <p className="text-[11px] uppercase text-slate-500">Premium entity</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
