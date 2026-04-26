import { useSelector } from '@/services/store/store';
import { selectLikedItems } from '@/services/selectors/likeSelectors';
import { UserCard } from '@/widgets/userCard/userCard';
import { usersData } from '@/shared/mocks/usersData';
import { Button } from '@/shared/ui/button/button';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileFavorites.module.css';

export function ProfileFavorites() {
  const likedItems = useSelector(selectLikedItems);
  const navigate = useNavigate();

  const likedUsers = usersData.filter(user => likedItems[user._id]);

  if (likedUsers.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyText}>К сожалению, на данный момент, избранных обменов нет</p>
        <Button type="primary" onClick={() => navigate('/')}>
          На главную
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {likedUsers.map(user => (
        <UserCard key={user._id} {...user} showDetails={true} showLike={true} />
      ))}
    </div>
  );
}
