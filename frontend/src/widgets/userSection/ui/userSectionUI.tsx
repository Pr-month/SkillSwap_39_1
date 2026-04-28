import React from 'react';
import styles from './userSection.module.css';
import { UserCard } from '@/widgets/userCard/userCard';
import { InfiniteScroll } from '../../../features/scroll/infiniteScroll/infiniteScroll';
import { User } from '@/entities/user/model/types';
import { Button } from '@/shared/ui/button/button';

interface UserSectionUIProps {
  displayTitle: string;
  buttonText: string;
  buttonAction?: () => void;
  users: User[];
  onLoadMore?: () => void;
  loading?: boolean;
  isRecommended?: boolean;
  hasMore?: boolean;
}

export const UserSectionUI: React.FC<UserSectionUIProps> = ({
  displayTitle,
  buttonText,
  buttonAction,
  users,
  onLoadMore,
  loading,
  isRecommended = false,
  hasMore = false, // По умолчанию false — безопасно
}) => {
  if (users.length === 0) return null;

  return (
    <div className={styles.category}>
      <div className={styles.categoryHeader}>
        <h1>{displayTitle}</h1>
        {buttonAction && (
          <div className={styles.customButton}>
            <Button type="tertiary" onClick={buttonAction}>
              {buttonText}
            </Button>
          </div>
        )}
      </div>

      {isRecommended ? (
        <InfiniteScroll
          items={users}
          renderItem={user => <UserCard {...user} />}
          hasMore={hasMore} // ✅ Динамическое значение
          onLoadMore={onLoadMore ?? (() => {})} // ✅ Безопасный fallback
          loading={loading}
          minItems={20}
        />
      ) : (
        <div className={styles.usersGrid}>
          {users.map(user => (
            <UserCard key={user._id} {...user} />
          ))}
        </div>
      )}
    </div>
  );
};
