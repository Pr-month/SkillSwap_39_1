import styles from './Logo.module.css';

export const Logo = () => {
  return (
    <div className={styles.logoContainer}>
      <div className={styles.logoWrapper}>
        <div className={styles.logoCircle}></div>
        <div className={styles.logoIcon}></div>
      </div>
      <span className={styles.logoText}>SkillSwap</span>
    </div>
  );
};
