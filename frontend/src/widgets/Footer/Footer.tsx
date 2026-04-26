import { Link } from 'react-router-dom';
import { Logo } from '@/shared/ui/Logo/Logo';
import styles from './Footer.module.css';
import { useEffect, useState } from 'react';

export const Footer = () => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const checkTheme = () => {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      }
    };

    checkTheme();

    // Проверяем изменения темы каждые 200мс
    const interval = setInterval(checkTheme, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className={`${styles.footer} ${currentTheme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <Logo />
          <p className={styles.copyright}>SkillSwap — {new Date().getFullYear()}</p>
        </div>

        <div className={styles.section}>
          <ul className={`${styles.linksList} ${styles.withBullets}`}>
            <li>
              <Link to="/about">О проекте</Link>
            </li>
            <li>
              <Link to="/all_skills">Все навыки</Link>
            </li>
          </ul>
        </div>

        <div className={styles.section}>
          <ul className={styles.linksList}>
            <li>
              <Link to="/contacts">Контакты</Link>
            </li>
            <li>
              <Link to="/blog">Блог</Link>
            </li>
          </ul>
        </div>

        <div className={styles.section}>
          <ul className={styles.linksList}>
            <li>
              <Link to="/privacy">Политика конфиденциальности</Link>
            </li>
            <li>
              <Link to="/terms">Пользовательское соглашение</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
