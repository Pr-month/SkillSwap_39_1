import { Link } from 'react-router-dom';
import styles from './ProfileSidebar.module.css';

const sidebarItems = [
  { icon: 'request', text: 'Заявки', route: '/profile/requests' },
  { icon: 'message-text', text: 'Мои обмены', route: '/profile/exchanges' },
  { icon: 'like', text: 'Избранное', route: '/profile/favorites' },
  { icon: 'idea', text: 'Мои Навыки', route: '/profile/skills' },
  { icon: 'user', text: 'Личные данные', route: '/profile/details' },
];

interface ProfileSidebarProps {
  currentPath: string;
}

export function ProfileSidebar({ currentPath }: ProfileSidebarProps) {
  return (
    <aside className={styles.profileSidebar}>
      <div className={styles.profileSidebarItems}>
        {sidebarItems.map(item => {
          const isActive = currentPath === item.route;
          return (
            <Link
              key={item.text}
              to={item.route}
              className={isActive ? styles.profileSidebarItemActive : styles.profileSidebarItem}
            >
              <span
                className={`${styles.profileSidebarIcon} ${styles['sidebarIcon-' + item.icon]}`}
              />
              {item.text}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
