import styles from './moreButton.module.css';

interface MoreButtonProps {
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

export const MoreButton: React.FC<MoreButtonProps> = ({
  onClick,
  className = '',
  ariaLabel = 'Еще',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.moreButton} ${className}`}
      aria-label={ariaLabel}
      data-testid="more-button"
    />
  );
};
