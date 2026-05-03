import Image from "next/image";
import styles from "../dashboard.module.css";

export default function Sidebar() {
  return (
    <section className={`${styles.sideBarContainer} ` }>
      <section className={`${styles.navContainer}`}>
        <div className="flex flex-col items-start justify-center">
          <h6>ChainWill</h6>
          <p>Digital Notary</p>
        </div>

        <ul className="flex flex-col items-start">
          <li className="">
            <a href="" className="flex items-center gap-2">
              <Image
                className={styles.logoImage}
                src="/overview_d.png"
                alt="Footer Icon"
                width={17.64}
                height={17.64}
              />
              <span>Overview</span>
            </a>
          </li>
          <li>
            <a href="" className="flex items-center gap-2">
              <Image
                className={styles.logoImage}
                src="/Assets_d.png"
                alt="Footer Icon"
                width={17.64}
                height={17.64}
              />
               <span>Assets</span>
            </a>
           
          </li>
          <li>
            <a href="" className="flex items-center gap-2">
              <Image
                className={styles.logoImage}
                src="/beneficiary_d.png"
                alt="Footer Icon"
                width={17.64}
                height={17.64}
              />
               <span>Beneficiaries</span>
            </a>
           
          </li>
          <li>
            <a href="" className="flex items-center gap-2">
              <Image
                className={styles.logoImage}
                src="/signers_d.png"
                alt="Footer Icon"
               width={17.64}
                height={17.64}
              />
               <span>Signers</span>
            </a>
           
          </li>

          <li>
            <a href="" className="flex items-center gap-2">
              <Image
                className={styles.logoImage}
                src="/settings_d.png"
                alt="Footer Icon"
                 width={17.64}
                height={17.64}
              />
              <span>Settings</span>
            </a>
            
          </li>
        </ul>
      </section>



      <section>
        <button className="bg-[#312E81] text-[white]">
            + Draft New Will
        </button>

        <div className={styles.user}>
            <Image
                className={styles.logoImage}
                src="/user_profile.png"
                alt="Footer Icon"
                width={32}
                height={32}
              />

              <section>
                <h6 className="text-[14px] text-[#312E81]">ox72...9E41</h6>
                <p>PREMIUM ENTITY</p>
              </section>
        </div>
      </section>
    </section>
  );
}
