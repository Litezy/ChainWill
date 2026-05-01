"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
  ];

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-outline-variant bg-slate-50/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 w-full">
        <div className="flex items-center gap-12 justify-between w-full">
          <Link
            className="font-headline-md text-xl font-bold tracking-tight text-indigo-900"
            href="/"
          >
            ChainWill
          </Link>

          <div className="hidden items-center gap-8 font-sans text-sm font-medium md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  className={`transition-colors hover:text-indigo-700 ${
                    isActive
                      ? "border-b-2 border-indigo-700 font-bold text-indigo-700"
                      : "text-slate-600"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <button type="button" className="rounded-lg bg-primary px-6 py-2.5 text-label-bold font-label-bold text-on-primary transition-all hover:opacity-90 active:scale-95">
            Connect Wallet
          </button>
        </div>
      </nav>
    </header>
  );
}
