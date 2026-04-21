import { selectToUserExchangeRequest } from '@/services/selectors/exchangeSelectors';
import { markAsRead } from '@/services/slices/exchangeSlice';
import { useDispatch, useSelector } from '@/services/store/store';
import styles from './requestPanel.module.css';

/* ВРЕМЕННОЕ РЕШЕНИЕ */

//Боковая панель с уведомлениями об обменах

const RequestPanel = () => {
  const requests = useSelector(selectToUserExchangeRequest);
  const dispatch = useDispatch();

  // Фильтруем только непрочитанные запросы
  const unreadRequests = requests.filter(request => !request.isRead);

  const handleRemove = (id: string | number) => {
    dispatch(markAsRead(id));
  };

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className={styles.sidePanel}>
      {unreadRequests.map(request => (
        <div key={request.id} className={styles.requestCard}>
          <div className={styles.cardContent}>
            <div className={styles.requestTextContainer}>
              <div className={styles.icon}></div>
              <span className={styles.requestText}>
                {request.fromUserName} предлагает вам обмен
              </span>
              <button className={styles.closeBtn} onClick={() => handleRemove(request.id)}>
                <div className={styles.closeIcon}></div>
              </button>
            </div>
            <button className={styles.goBtn}>
              {/* Здесь будет логика перехода к обмену
                // Например: navigate(`/exchange/${request.id}`);*/}
              Перейти
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RequestPanel;
