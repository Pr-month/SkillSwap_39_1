import styles from './likeButton.module.css';
import { useLike } from '@/shared/hooks/useLike';

interface LikeButtonProps {
  itemId: string;
  className?: string;
  ariaLabel?: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  itemId,
  className = '',
  ariaLabel = 'Поставить лайк',
}) => {
  const { isLiked, toggleLike } = useLike({ itemId });

  return (
    <button
      type="button"
      onClick={toggleLike}
      className={`${className} ${isLiked ? styles.likeButtonActive : styles.likeButton}`}
      aria-label={isLiked ? 'Убрать лайк' : ariaLabel}
      data-testid="like-button"
    />
  );
};
