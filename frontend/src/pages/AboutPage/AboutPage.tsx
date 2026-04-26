import { Logo } from '@/shared/ui/Logo/Logo';
import styles from './AboutPage.module.css';

export const AboutPage = () => {
  return (
    <div className={styles.aboutContainer}>
      <div className={styles.logoWrapper}>
        <Logo />
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>О проекте SkillSwap</h1>
        <p className={styles.description}>
          Это современный веб-проект на React/TypeScript, предназначенный для обмена навыками по
          принципу «Я научу / Хочу научиться». Наша платформа соединяет людей, которые хотят
          поделиться своими знаниями и умениями с теми, кто стремится освоить новые навыки.
        </p>
        <p className={styles.description}>
          SkillSwap создает сообщество, где каждый может быть и учителем, и учеником, помогая друг
          другу расти и развиваться в дружелюбной атмосфере.
        </p>
      </div>
    </div>
  );
};
