import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWillOwner } from "@/hooks/child/useWillOwner";
import { useContractStore } from "@/stores/contractStore";
import { useEffect } from "react";
import { useContractCaller } from "@/config/contracts";

export default function Header() {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { ownsWill, isLoading: isCheckingWill } = useWillOwner(address);
  const { factoryContractConfig } = useContractCaller();
  const setContractAddress = useContractStore((s) => s.setContractAddress);
  const reset = useContractStore((s) => s.reset);

  // ── fetch owner's wills from factory ───────────────────────────────
  const { data: ownerWills } = useReadContract({
    ...factoryContractConfig,
    functionName: "getWillsByOwner",
    args: address ? [address] : undefined,
    query: { enabled: !!address && isConnected },
  });

  // ── on connect: restore contract address into store ─────────────────
  useEffect(() => {
    if (!isConnected || !ownerWills) return;

    const wills = ownerWills as string[];
    if (wills.length > 0) {
      // one will per owner — always take the first
      setContractAddress(wills[0]);
    }
  }, [isConnected, ownerWills, setContractAddress]);

  // ── on disconnect: clear store ──────────────────────────────────────
  useEffect(() => {
    if (!isConnected) {
      reset();
    }
  }, [isConnected, reset]);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
  ];


  return (
    <header className="fixed z-50 w-full border-b border-slate-200 bg-slate-50/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* logo */}
        <Link
          className="text-xl !text-primary !font-extrabold tracking-wide"
          to="/"
        >
          ChainWill
        </Link>

        {/* nav links */}
        <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`transition-colors ${
                  isActive
                    ? "border-b-2 border-indigo-700 text-indigo-700"
                    : "hover:text-indigo-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* right side actions */}
        <div className="flex items-center gap-3">
          {isConnected &&
            !isCheckingWill &&
            (ownsWill ? (
              <button
                onClick={() => navigate("/auth/overview")}
                type="button"
                className="rounded-xl bg-primary px-5 py-2 !text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Visit Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate("/create-will")}
                type="button"
                className="rounded-xl bg-primary px-5 py-2 !text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Create New Will
              </button>
            ))}

          <ConnectButton
            accountStatus="address"
            chainStatus="icon"
            showBalance={false}
            label="Connect Wallet"
          />
        </div>
      </nav>
    </header>
  );
}
