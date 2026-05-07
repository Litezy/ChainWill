import { LayoutGrid, Settings, UserCheck, Users, Wallet } from "lucide-react";

export const dashboardNavItems = [
  { label: "Overview", icon: LayoutGrid, to: "/auth/overview" },
  { label: "Assets", icon: Wallet, to: "/auth/assets" },
  { label: "Beneficiaries", icon: Users, to: "/auth/beneficiaries" },
  { label: "Signers", icon: UserCheck, to: "/auth/signers" },
  { label: "Settings", icon: Settings, to: "/auth/settings" },
];