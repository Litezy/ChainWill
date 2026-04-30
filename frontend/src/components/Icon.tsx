type IconProps = {
  name:
    | "arrowRight"
    | "bolt"
    | "checkCircle"
    | "code"
    | "codeOff"
    | "factory"
    | "gavel"
    | "grid"
    | "group"
    | "history"
    | "hub"
    | "lan"
    | "link"
    | "lock"
    | "lockReset"
    | "notification"
    | "openInNew"
    | "policy"
    | "rule"
    | "savings"
    | "sendArchive"
    | "terminal"
    | "timer"
    | "token"
    | "verified"
    | "verifiedUser"
    | "wallet";
  className?: string;
};

const paths = {
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  checkCircle: (
    <>
      <path d="M21 11.1V12a9 9 0 1 1-5.3-8.2" />
      <path d="m9 11 3 3L22 4" />
    </>
  ),
  code: (
    <>
      <path d="m8 9-4 3 4 3" />
      <path d="m16 9 4 3-4 3" />
      <path d="m14 5-4 14" />
    </>
  ),
  codeOff: (
    <>
      <path d="m8 9-4 3 4 3" />
      <path d="m16 9 4 3-4 3" />
      <path d="m4 4 16 16" />
    </>
  ),
  factory: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V8l5 3V8l5 3V6h4v15" />
      <path d="M9 17h1" />
      <path d="M14 17h1" />
    </>
  ),
  gavel: (
    <>
      <path d="m14 13-7 7" />
      <path d="m8 6 6 6" />
      <path d="m11 3 6 6" />
      <path d="m16 8-5 5" />
      <path d="m2 22 6-6" />
    </>
  ),
  grid: (
    <>
      <path d="M4 4h6v6H4z" />
      <path d="M14 4h6v6h-6z" />
      <path d="M4 14h6v6H4z" />
      <path d="M14 14h6v6h-6z" />
    </>
  ),
  hub: (
    <>
      <circle cx="12" cy="12" r="3" />
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="6" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="m7 7.5 3 2.7" />
      <path d="m17 7.5-3 2.7" />
      <path d="m7 16.5 3-2.7" />
      <path d="m17 16.5-3-2.7" />
    </>
  ),
  group: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
      <circle cx="12" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8" />
      <path d="M2 21v-2a4 4 0 0 1 3-3.9" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 3v6h6" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  lan: (
    <>
      <rect height="6" rx="1" width="6" x="9" y="3" />
      <rect height="6" rx="1" width="6" x="3" y="15" />
      <rect height="6" rx="1" width="6" x="15" y="15" />
      <path d="M12 9v3" />
      <path d="M6 15v-2h12v2" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
      <path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" />
    </>
  ),
  lock: (
    <>
      <rect height="11" rx="2" width="16" x="4" y="11" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  lockReset: (
    <>
      <rect height="11" rx="2" width="16" x="4" y="11" />
      <path d="M8 11V8a4 4 0 0 1 7.5-2" />
      <path d="M15 3h4v4" />
      <path d="m19 3-4 4" />
    </>
  ),
  notification: (
    <>
      <path d="M10.3 21a2 2 0 0 0 3.4 0" />
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M12 9v3" />
      <path d="M12 16h.01" />
    </>
  ),
  openInNew: (
    <>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </>
  ),
  policy: (
    <>
      <path d="M12 3 5 6v5c0 4.2 2.8 8.1 7 10 4.2-1.9 7-5.8 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-5" />
    </>
  ),
  rule: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h10" />
      <path d="M4 17h7" />
      <path d="m15 17 2 2 4-4" />
    </>
  ),
  savings: (
    <>
      <path d="M5 11a7 7 0 0 1 7-7h5v5a7 7 0 0 1-7 7H5v-5Z" />
      <path d="M5 21v-5" />
      <path d="M12 8v8" />
      <path d="m9 11 3-3 3 3" />
    </>
  ),
  sendArchive: (
    <>
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      <path d="M4 22h8" />
    </>
  ),
  terminal: (
    <>
      <path d="m4 7 5 5-5 5" />
      <path d="M12 19h8" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M9 2h6" />
    </>
  ),
  token: (
    <>
      <path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z" />
      <path d="m12 8 3 1.7v3.6L12 15l-3-1.7V9.7L12 8Z" />
    </>
  ),
  verified: (
    <>
      <path d="m12 2 2.3 3.1 3.8-.5.5 3.8L22 12l-3.4 3.6-.5 3.8-3.8-.5L12 22l-2.3-3.1-3.8.5-.5-3.8L2 12l3.4-3.6.5-3.8 3.8.5L12 2Z" />
      <path d="m8.5 12 2.3 2.3 4.7-5" />
    </>
  ),
  verifiedUser: (
    <>
      <path d="M12 3 5 6v5c0 4.2 2.8 8.1 7 10 4.2-1.9 7-5.8 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-5" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
      <path d="M16 12h4" />
      <path d="M4 8h16" />
    </>
  ),
};

export default function Icon({ name, className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}
