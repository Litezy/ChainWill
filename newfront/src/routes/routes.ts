import Assets from "@/pages/Dashboard/Assets";
import Beneficiaries from "@/pages/Dashboard/Beneficiaries";
import Overview from "@/pages/Dashboard/Overview";
import Settings from "@/pages/Dashboard/Settings";
import Signers from "@/pages/Dashboard/Signers";
import About from "@/pages/General/About";
import ClaimInheritance from "@/pages/General/ClaimInheritance";
import Home from "@/pages/General/Home";
import HowItWorks from "@/pages/General/HowItWorks";

export const GeneralPages = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  { path: "/how-it-works", component: HowItWorks },
];

export const StandalonePages = [
  { path: "/claim-inheritance", component: ClaimInheritance },
];

export const DashboardPages = [
  { path: "/auth/overview", component: Overview },
  { path: "/auth/assets", component: Assets },
  { path: "/auth/beneficiaries", component: Beneficiaries },
  { path: "/auth/signers", component: Signers },
  { path: "/auth/settings", component: Settings },
];
