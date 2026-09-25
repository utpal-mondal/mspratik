import Image from "next/image";
import styles from "./Loader.module.css";

const Loader = () => {
  return (
    <div className={styles.loaderContainer}>
      <Image
        src="/images/a-unique-logo.png"
        alt="A Unique Logo"
        width={140}
        height={140}
        priority
        className={styles.logo}
      />

      <p className={styles.loadingText}>Please wait...</p>
    </div>
  );
};

export default Loader;
