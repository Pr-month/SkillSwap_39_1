import { useAuth } from '@/features/auth/context/AuthContext';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { useState, useRef, useEffect } from 'react';
import { NotificationMenu } from '../NotificationMenu/NotificationMenu';
import styles from './UserPanel.module.css';
import { Link, useNavigate } from 'react-router-dom';

export const UserPanel = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleNotifications = () => setIsNotificationsOpen(!isNotificationsOpen);
  const closeAll = () => {
    setIsMenuOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useClickOutside(panelRef, closeAll);

  useEffect(() => {
    if (isNotificationsOpen || isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isNotificationsOpen, isMenuOpen]);

  return (
    <div className={styles.userPanel} ref={panelRef}>
      <div className={styles.iconsContainer}>
        <div className={styles.iconWrapper} onClick={toggleNotifications}>
          <span className={styles.notificationIcon}></span>
          <span className={styles.notificationBadge}></span>
        </div>
        <div className={styles.iconWrapper}>
          <span className={styles.likeIcon}></span>
        </div>
        <div className={styles.userInfo} onClick={toggleMenu}>
          <span className={styles.userName}>{user?.name}</span>
          <div className={styles.avatar}>
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="User avatar"
                className={styles.avatarImage}
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              user?.name
                .split(' ')
                .map(n => n[0])
                .join('')
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className={styles.modalMenu}>
          <Link to="/profile/details" className={styles.menuItemLk}>
            Личный кабинет
          </Link>
          <button className={styles.menuItemOut} onClick={handleLogout}>
            Выйти из аккаунта
            <span className={styles.logoutIcon}></span>
          </button>
        </div>
      )}

      <NotificationMenu isOpen={isNotificationsOpen} />
    </div>
  );
};
