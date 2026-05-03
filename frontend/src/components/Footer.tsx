import { Link } from "react-router-dom";
import Icon from "@/components/Icon";

const footerLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

const footerIcons = ["terminal", "policy"] as const;

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-10 py-8 md:flex-row">
        <div className="mb-6 text-center md:mb-0 md:text-left">
          <h2 className="mb-1 text-lg font-bold text-indigo-900">ChainWill</h2>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} ChainWill. Secured by Smart Contracts.
          </p>
        </div>

        <nav className="flex gap-8" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="!text-xs !text-primary transition-colors hover:text-indigo-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 flex gap-4 md:mt-0">
          {footerIcons.map((icon) => (
            <button
              key={icon}
              type="button"
              aria-label={icon}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 transition-all hover:bg-indigo-100 hover:text-indigo-900"
            >
              <Icon className="h-[18px] w-[18px]" name={icon} />
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
