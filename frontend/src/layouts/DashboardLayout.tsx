import React, { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import Sidebar from "@/components/dashboard/Sidebar";
import CreateNewWill from "@/pages/General/CreateNewWill";
import { dashboardNavItems } from "@/components/dashboard/sidebarConfig";
import { useCallReadMethods } from "@/hooks/contract/useCallReadMethods";
import { useContractStore } from "@/stores/contractStore";
import { useWillStatus } from "@/hooks/child/useWillStatus";
import ConfirmModal from "@/modals/ConfirmModal";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [createWillOpen, setCreateWillOpen] = useState(false);

  const { address } = useAccount();
  const setContractAddress = useContractStore((s) => s.setContractAddress);
  const { callReadFunction } = useCallReadMethods("factory");

  // Resolve the owner's deployed will address from the factory every time
  // the connected wallet changes, then keep it in global store so all reads
  // that depend on it (useWillStatus, child hooks, etc.) fire immediately.
  useEffect(() => {
    if (!address) return;
    const resolve = async () => {
      const wills = await callReadFunction<string[]>("getWillsByOwner", [
        address,
      ]);
      if (wills && wills.length > 0) {
        setContractAddress(wills[wills.length - 1]);
      }
    };
    void resolve();
  }, [address, callReadFunction, setContractAddress]);

  // Single call in the layout means every dashboard page gets a fresh
  // status fetch on mount without each page needing its own call.
  useWillStatus();

  const { disconnect } = useDisconnect();
  const [logout, setLogout] = useState(false);

  const navigate = useNavigate();

  const logoutFn = () => {
    disconnect();
    // clear persisted contract state
    useContractStore.getState().reset();

    // redirect home
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <div className="lg:ml-[18%]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-100/95 px-4 py-3 backdrop-blur-sm lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <Link
              to="/auth/overview"
              className="text-base font-semibold text-slate-950"
            >
              Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLogout(true)}
                className="text-xs font-semibold text-red-500 hover:opacity-80"
              >
                <LogOut />
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-950 shadow-sm"
              >
                {menuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
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

        <main className="min-h-screen overflow-y-auto  py-4 md:px-4 md:py-6">
          {children}
        </main>
      </div>

      {logout && (
        <ConfirmModal
          onClose={() => setLogout(false)}
          onConfirm={logoutFn}
          question="Are you sure you want to logout?"
        />
      )}

      {createWillOpen && (
        <CreateNewWill onClose={() => setCreateWillOpen(false)} />
      )}
    </div>
  );
};

export default DashboardLayout;
