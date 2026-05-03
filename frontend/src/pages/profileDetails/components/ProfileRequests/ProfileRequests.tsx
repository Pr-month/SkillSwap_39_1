import { useSelector } from '@/services/store/store';
import { selectToUserExchangeRequest } from '@/services/selectors/exchangeSelectors';
import { selectCatalogItems } from '@/services/selectors/catalogSelectors';
import { UserCard } from '@/widgets/userCard/userCard';
import { Button } from '@/shared/ui/button/button';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileRequests.module.css';

export function ProfileRequests() {
  const navigate = useNavigate();
  const catalogUsers = useSelector(selectCatalogItems);
  const allRequests = useSelector(selectToUserExchangeRequest);
  const requestUsers = allRequests
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
