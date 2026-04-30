import Icon from "@/components/Icon";

const footerLinks = ["Privacy Policy", "Terms & Conditions"];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-10 py-8 md:flex-row">
        <div className="mb-6 md:mb-0">
          <div className="mb-1 text-lg font-bold text-indigo-900">ChainWill</div>
          <div className="font-sans text-xs text-slate-500">
            © {new Date().getFullYear()} ChainWill. Secured by Smart Contracts.
          </div>
        </div>

        <div className="flex gap-8">
          {footerLinks.map((link) => (
            <a
              className="font-sans text-xs text-slate-500 transition-colors hover:text-indigo-600"
              href="#"
              key={link}
            >
              {link}
            </a>
          ))}
        </div>

        <div className="mt-6 flex gap-4 md:mt-0">
          {(["terminal", "policy"] as const).map((icon) => (
            <div
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-200 text-slate-600 transition-all hover:bg-indigo-100 hover:text-indigo-900"
              key={icon}
            >
              <Icon className="h-[18px] w-[18px]" name={icon} />
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
