import { useSelector } from '@/services/store/store';
import { selectFromUserExchangeRequest } from '@/services/selectors/exchangeSelectors';
import { selectCatalogItems } from '@/services/selectors/catalogSelectors';
import { UserCard } from '@/widgets/userCard/userCard';
import { Button } from '@/shared/ui/button/button';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileExchanges.module.css';
import { useAuth } from '@/features/auth/context/AuthContext';

export function ProfileExchanges() {
  const { user } = useAuth();
  const allRequests = useSelector(selectFromUserExchangeRequest);
  const catalogUsers = useSelector(selectCatalogItems);
  const requests = allRequests.filter(request => request.fromUserId === user?.id);
  const exchangeUsers = requests
    .map(request => catalogUsers.find(catalogUser => catalogUser._id === request.toUserId))
    .filter(Boolean);
  const navigate = useNavigate();

  if (exchangeUsers.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyText}>К сожалению, на данный момент, предложенных обменов нет</p>
        <Button type="primary" onClick={() => navigate('/')}>
          На главную
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {exchangeUsers.map(exchangeUser => {
        if (!exchangeUser) return null;

        return <UserCard key={exchangeUser._id} {...exchangeUser} showDetails={true} />;
      })}
    </div>
  );
}
