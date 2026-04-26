import { FC } from 'react';
import styles from './registrationInfoPanel.module.css';

type RegistrationInfoPanelProps = {
  headerText: string;
  icon: string;
  text: string;
};

export const RegistrationInfoPanel: FC<RegistrationInfoPanelProps> = ({
  headerText,
  icon,
  text,
}) => {
  return (
    <section className={styles.aboutSection}>
      <img src={icon} className={styles.icon} />
      <div className={styles.infoBlock}>
        <header className={styles.infoBlockHeader}>{headerText}</header>
        <p className={styles.infoBlockText}>{text}</p>
      </div>
    </section>
  );
};
