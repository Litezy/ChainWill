import Admin from "@/pages/Admin/Admin";
import Assets from "@/pages/Dashboard/Assets";
import Beneficiaries from "@/pages/Dashboard/Beneficiaries";
import Overview from "@/pages/Dashboard/Overview";
import Settings from "@/pages/Dashboard/Settings";
import Signers from "@/pages/Dashboard/Signers";

import About from "@/pages/General/About";
import ClaimInheritance from "@/pages/General/ClaimInheritance";
import CreateNewWill from "@/pages/General/CreateNewWill";
import Home from "@/pages/General/Home";
import HowItWorks from "@/pages/General/HowItWorks";
import PrivacyPolicy from "@/pages/General/PrivacyPolicy";
import SignInheritance from "@/pages/General/SignInheritance";
import TermsAndCondition from "@/pages/General/TermsAndCondition";

export const GeneralPages = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  { path: "/how-it-works", component: HowItWorks },
  { path: "/privacy-policy", component: PrivacyPolicy },
  { path: "/terms-and-conditions", component: TermsAndCondition },
];

export const StandalonePages = [
  { path: "/claim-inheritance/:email", component: ClaimInheritance },
  {path: "/create-will", component: CreateNewWill },
  {path: "/admin", component: Admin },
  {path: "sign-inheritance", component: SignInheritance}
];

export const DashboardPages = [
  { path: "/auth/overview", component: Overview },
  { path: "/auth/assets", component: Assets },
  { path: "/auth/beneficiaries", component: Beneficiaries },
  { path: "/auth/signers", component: Signers },
  { path: "/auth/settings", component: Settings },
];


//links from email
// signers 
// http://localhost:5173/sign-inheritance/signersemail

//beneficiaries 
// http://localhost:5173/claim-inheritance/beneficiaryemail'

