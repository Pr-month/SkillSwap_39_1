import { useSelector } from '@/services/store/store';
import { selectToUserExchangeRequest } from '@/services/selectors/exchangeSelectors';
import { selectCatalogItems } from '@/services/selectors/catalogSelectors';
import { UserCard } from '@/widgets/userCard/userCard';
import { Button } from '@/shared/ui/button/button';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileRequests.module.css';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useEffect } from 'react';

export function ProfileRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const catalogUsers = useSelector(selectCatalogItems);

  // ✅ useSelector ПЕРВЫМ!
  const allRequests = useSelector(selectToUserExchangeRequest);
  
  // ✅ Ранний редирект БЕЗ return (не прерывает hooks)
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // ✅ Логика после всех hooks
  const requests = allRequests.filter(request => request.toUserId === user?.id || false);
  const requestUsers = requests
    .map(request => catalogUsers.find(catalogUser => catalogUser._id === request.fromUserId))
    .filter(Boolean);

  if (requestUsers.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyText}>К сожалению, на данный момент, заявок на обмен нет</p>
        <Button type="primary" onClick={() => navigate('/')}>
          На главную
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {requestUsers.map(requestUser => {
        if (!requestUser) return null;

        return <UserCard key={requestUser._id} {...requestUser} showDetails={true} />;
      })}
    </div>
  );
}
