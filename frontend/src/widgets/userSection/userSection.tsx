import React, { useMemo, useState } from 'react';
import { UserSectionUI } from './ui/userSectionUI';
import { User } from '@/entities/user/model/types';

interface UserSectionProps {
  title: string;
  users: User[];
  isFiltered?: boolean;
  showAllButton?: boolean;
  count?: number;
  onShowAll?: () => void;
  onLoadMore?: () => void;
  loading?: boolean;
  isRecommended?: boolean;
  hasMore?: boolean;
}

export const UserSection: React.FC<UserSectionProps> = ({
  title,
  users,
  isFiltered = false,
  showAllButton = true,
  count = 0,
  onShowAll,
  onLoadMore,
  loading = false,
  hasMore = false,
}) => {
  const [sortNewFirst, setSortNewFirst] = useState(true);

  const displayTitle = isFiltered ? `${title}: ${count}` : title;

  const buttonText = isFiltered
    ? sortNewFirst
      ? '↑↓ сначала старые'
      : '↑↓ сначала новые'
    : 'Смотреть все';

  const handleButtonClick = () => {
    if (isFiltered) {
      setSortNewFirst(!sortNewFirst);
    } else if (onShowAll) {
      onShowAll();
    }
  };

  const sortedUsers = useMemo(() => {
    if (!isFiltered) return users;
    return [...users].sort((a, b) =>
      sortNewFirst
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [users, isFiltered, sortNewFirst]);

  return (
    <UserSectionUI
      displayTitle={displayTitle}
      buttonText={buttonText}
      buttonAction={showAllButton ? handleButtonClick : undefined}
      users={sortedUsers}
      onLoadMore={onLoadMore}
      loading={loading}
      isRecommended={!isFiltered}
      hasMore={hasMore}
    />
  );
};
