import { CHAINWILL_CONTRACT } from "@/constants/contract";
import { LayoutGrid, Users, UserCheck, Settings, Wallet, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useDisconnect } from "wagmi";
import { useNavigate } from "react-router-dom";
import { useContractStore } from "@/stores/contractStore";
import { useState } from "react";
import ConfirmModal from "@/modals/ConfirmModal";

export const dashboardNavItems = [
  { label: "Overview", icon: LayoutGrid, to: "/auth/overview" },
  { label: "Assets", icon: Wallet, to: "/auth/assets" },
  { label: "Beneficiaries", icon: Users, to: "/auth/beneficiaries" },
  { label: "Signers", icon: UserCheck, to: "/auth/signers" },
  { label: "Settings", icon: Settings, to: "/auth/settings" },
];

const contractAddress =
  CHAINWILL_CONTRACT.slice(0, 6) + "..." + CHAINWILL_CONTRACT.slice(-4);

export default function Sidebar() {
  const { disconnect } = useDisconnect();
  const [logout,setLogout] = useState(false);

  const navigate = useNavigate();

  const logoutFn = () => {
    disconnect();
    // clear persisted contract state
    useContractStore.getState().reset();

    // redirect home
    navigate("/");
  };
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
                "flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition-colors";

              return (
                <li key={label}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `${commonClasses} ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
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
        {/* <ConnectButton
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
          label="Connect Wallet"
        /> */}

        <div className="flex items-center justify-between gap-4 rounded-[28px] bg-white px-3 py-3 shadow-sm">
          <div className="flex items-center gap-4">
            {/* <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              CW
            </div> */}
            <div>
              <p className="text-sm font-semibold text-slate-950">
                {contractAddress}
              </p>
              <p className="text-[11px] uppercase text-slate-500">
                Will Owner's Name
              </p>
            </div>
          </div>

          <button
            onClick={()=> setLogout(true)}
            className="text-xs font-semibold text-red-500 hover:opacity-80"
          >
            <LogOut/>
          </button>
        </div>

        {logout && <ConfirmModal onClose={() => setLogout(false)} onConfirm={logoutFn} question="Are you sure you want to logout?" />}
      </div>
    </aside>
  );
}
