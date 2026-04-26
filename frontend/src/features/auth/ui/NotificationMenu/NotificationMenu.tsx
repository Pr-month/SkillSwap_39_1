import {
  selectFromUserExchangeRequest,
  selectToUserExchangeRequest,
} from '@/services/selectors/exchangeSelectors';
import styles from './NotificationMenu.module.css';
import IdeaIcon from '@/app/assets/static/images/icons/idea.svg';
import { useDispatch, useSelector } from '@/services/store/store';
import { Button } from '@/shared/ui/button/button';
import { Link } from 'react-router-dom';
import { markAllAsRead } from '@/services/slices/exchangeSlice';

/*type Notification = {
  id: string;
  userName: string;
  type: 'incoming' | 'outgoing';
  status: 'pending' | 'accepted' | 'rejected';
  date: string;
  message: string;
  isNew: boolean;
};*/

type NotificationMenuProps = {
  isOpen: boolean;
};

export const NotificationMenu = ({ isOpen }: NotificationMenuProps) => {
  const dispatch = useDispatch();

  // Получаем данные из Redux
  const incoming = useSelector(selectToUserExchangeRequest);
  const outgoing = useSelector(selectFromUserExchangeRequest);

  if (!isOpen) return null;
  //{
  /* Временные моковые данные */
  //}
  /*const notifications: Notification[] = [
    {
      id: '1',
      userName: 'Николай',
      type: 'outgoing',
      status: 'accepted',
      date: 'сегодня',
      message: 'Перейдите в профиль, чтобы обсудить детали',
      isNew: true,
    },
    {
      id: '2',
      userName: 'Татьяна',
      type: 'incoming',
      status: 'pending',
      date: 'сегодня',
      message: 'Примите обмен, чтобы обсудить детали',
      isNew: true,
    },
    {
      id: '3',
      userName: 'Олег',
      type: 'incoming',
      status: 'pending',
      date: 'вчера',
      message: 'Примите обмен, чтобы обсудить детали',
      isNew: false,
    },
    {
      id: '4',
      userName: 'Игорь',
      type: 'outgoing',
      status: 'accepted',
      date: '23 мая',
      message: 'Перейдите в профиль, чтобы обсудить детали',
      isNew: false,
    },
  ];*/

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return 'сегодня';
    }

    return 'ранее';
    // Логика для "вчера", "23 мая" и т.д.
    // Можно использовать date-fns или Intl.DateTimeFormat
  };

  // Формируем уведомления
  const notifications = [
    // 1. Входящие запросы (показываем ВСЕ)
    ...incoming.map(req => ({
      id: req.id,
      userName: req.fromUserName,
      type: 'incoming' as const,
      status: req.status,
      date: formatDate(req.createdAt),
      message:
        req.status === 'pending'
          ? 'Предложен обмен — нажмите для ответа'
          : `Вы ${req.status === 'accepted' ? 'приняли' : 'отклонили'} этот обмен`,
      isNew: !req.isRead,
    })),

    // 2. Исходящие запросы (только с ответами)
    ...outgoing
      .filter(req => req.status === 'accepted')
      .map(req => ({
        id: req.id,
        userName: req.toUserName,
        type: 'outgoing' as const,
        status: req.status,
        date: formatDate(req.createdAt),
        message:
          req.status === 'accepted'
            ? `${req.toUserName} принял(а) ваш обмен`
            : `${req.toUserName} отклонил(а) ваш обмен`,
        isNew: !req.isRead,
      })),
  ];

  // Обработчики
  const handleReadAll = () => dispatch(markAllAsRead());
  //const handleClearViewed = () => dispatch(clearViewedRequests());

  const newNotifications = notifications.filter(n => n.isNew);
  const viewedNotifications = notifications.filter(n => !n.isNew);

  /*const getStatusText = (status: string, type: string) => {
    if (status === 'accepted') return 'принял ваш обмен';
    if (type === 'incoming') return 'предлагает вам обмен';
    return 'ожидает ответа';
  };*/

  const getStatusText = (status: string, type: string) => {
    if (type === 'incoming') {
      return status === 'accepted' ? 'принял обмен' : 'предлагает вам обмен';
    } else {
      return status === 'accepted' ? 'вы приняли обмен' : 'вы отклонили обмен';
    }
  };

  return (
    <div className={styles.notificationMenu} data-testid="notification-menu">
      <div className={styles.headerMenu}>
        <h3 className={styles.headerMenuTitle}>Новые уведомления</h3>
        <button onClick={handleReadAll} className={styles.readAll} data-testid="read-all-btn">
          Прочитать все
        </button>
      </div>

      <div className={styles.notificationList}>
        {newNotifications.map(notification => (
          <div
            key={notification.id}
            className={styles.notificationItem}
            data-testid="new-notification"
          >
            <div className={styles.notificationHeader}>
              <img src={IdeaIcon} alt="Иконка" className={styles.icon} />
              <div className={styles.notificationInfo}>
                <div className={styles.userLine}>
                  <span className={styles.userName}>{notification.userName}</span>
                  <span className={styles.statusText}>
                    {getStatusText(notification.status as string, notification.type)}
                  </span>
                  <span className={styles.date}>{notification.date}</span>
                </div>
                <p className={styles.message}>{notification.message}</p>
              </div>
            </div>
            <div className={styles.notificationActions}>
              <Link
                to={notification.type === 'incoming' ? '/obmen' : '/profile'}
                className={styles.buttonNotificationMenu}
                data-testid={notification.type === 'incoming' ? 'link-to-obmen' : 'link-to-profile'}
              >
                <Button type="primary">Перейти</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
      {viewedNotifications.length > 0 && (
        <div className={styles.viewedSection} data-testid="viewed-section">
          <div className={styles.viewedHeader}>
            <h3 className={styles.viewedHeaderTitle}>Просмотренные</h3>
            <button className={styles.clearButton} data-testid="clear-btn">
              Очистить
            </button>
          </div>
          {viewedNotifications.map(notification => (
            <div
              key={notification.id}
              className={styles.notificationItem}
              data-testid="viewed-notification"
            >
              <div className={styles.notificationView}>
                <img src={IdeaIcon} alt="Иконка" className={styles.icon} />
                <div className={styles.notificationInfo}>
                  <div className={styles.userLine}>
                    <span className={styles.userName}>{notification.userName}</span>
                    <span className={styles.statusText}>
                      {getStatusText(notification.status as string, notification.type)}
                    </span>
                    <span className={styles.date}>{notification.date}</span>
                  </div>
                  <p className={styles.message}>{notification.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
