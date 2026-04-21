import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button/button';
import styles from './GuestPanel.module.css';

export const GuestPanel = () => {
  return (
    <div className={styles.panel}>
      <Link to="/login" className={styles.link}>
        Войти
      </Link>
      <Link to="/register" className={styles.buttonLink}>
        <Button type="primary">Зарегистрироваться</Button>
      </Link>
    </div>
  );
};
