"use client";
import Image from "next/image";
import styles from "../app/page.module.css";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/Dashboard");

  return (
    !isDashboard && (
    <div className={styles.footerContainer}>
      <section>
        <h5 className={styles.logo}>ChainWill</h5>
        <p className={styles.secure}>
          &copy; {Date.now()} ChainWill. Secured by Smart Contracts.
        </p>
      </section>

      <section className={styles.policyContainer}>
        <a href="">
          <p>Privacy Policy</p>
        </a>
        <a href="">
          <p>Terms and condition</p>
        </a>
      </section>

      <section className={styles.footerImage}>
        <div className={styles.iconCircle}>
          <Image
            className={styles.logoImage}
            src="/Icon.png"
            alt="Footer Icon"
            width={16}
            height={16}
          />
        </div>

        <div className={styles.iconCircle}>
          <Image
            className={styles.logoImage}
            src="/footerIcon.png"
            alt="Footer Icon"
            width={16}
            height={16}
          />
        </div>
      </section>
    </div>
    )
  );
}
