import { useSelector } from '@/services/store/store';
import { selectToUserExchangeRequest } from '@/services/selectors/exchangeSelectors';
import { UserCard } from '@/widgets/userCard/userCard';
import { usersData } from '@/shared/mocks/usersData';
import { Button } from '@/shared/ui/button/button';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileRequests.module.css';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useEffect } from 'react';

export function ProfileRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  if (requests.length === 0) {
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
      {requests.map(request => {
        const user = usersData.find(u => u._id === request.fromUserId);
        if (!user) return null;

        return <UserCard key={request.id} {...user} showDetails={true} />;
      })}
    </div>
  );
}
