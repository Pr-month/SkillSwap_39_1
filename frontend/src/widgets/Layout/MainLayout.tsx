import { AuthProvider } from '@/features/auth/context/AuthProvider';
import { Header } from '@/widgets/Header/Header';
import { Footer } from '@/widgets/Footer/Footer';
import { Outlet } from 'react-router-dom';
import styles from './MainLayout.module.css';

export const MainLayout = () => {
  return (
    <AuthProvider>
      <Header />
      <main className={styles.content}>
        <Outlet />
      </main>
      <Footer />
    </AuthProvider>
  );
};
