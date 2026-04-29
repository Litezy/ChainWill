import Image from "next/image";
import styles from "../app/page.module.css";

export default function Header() {
  return (
    <div className={styles.homeContainer}>
      <h5 className={styles.logo}><a href="/"> ChainWill</a></h5>

      <ul className={styles.navbar}>
        <a href="">
          <li>Home</li>
        </a>
        <a href="">
          <li>About</li>
        </a>
        <a href="">
          <li>How it Works</li>
        </a>
      </ul>

      <button type="button" className={styles.connectWallet}>Connect Wallet</button>
    </div>
  );
}
