import styles from './userInfo.module.css';
import { UserCard } from '../userCard/userCard';
import { User } from '@/entities/user/model/types';

interface UserInfoProps {
  user: User;
}

const UserInfo: React.FC<UserInfoProps> = ({ user }) => {
  if (!user) {
    return <div className={styles.userInfo}>Пользователь не найден</div>;
  }

  return (
    <div className={styles.userInfo}>
      <UserCard {...user} showLike={false} showDescription={true} showDetails={false} />
    </div>
  );
};

export default UserInfo;
