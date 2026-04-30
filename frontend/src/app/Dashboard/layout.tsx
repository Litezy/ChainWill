import type { Metadata } from "next";

import styles from "./dashboard.module.css";
import Sidebar from "./components/Sidebar";
// import "./globals.css";


export default function Dashboard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <div className={styles.dashboardContainer}>
        <Sidebar />
        <div>{children}</div>
        </div>
        
        
  );
}
