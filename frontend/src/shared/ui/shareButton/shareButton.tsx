import styles from './shareButton.module.css';
import { useCallback } from 'react';
import { useShare } from '@/shared/hooks/useShare';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
  ariaLabel?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  text,
  url,
  className = '',
  ariaLabel = 'Поделиться',
}) => {
  const { share, isSupported } = useShare();

  const handleClick = useCallback(async () => {
    await share({
      title,
      text,
      url: url || window.location.href,
    });
  }, [share, title, text, url]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.shareButton} ${className}`}
      aria-label={ariaLabel}
      title={isSupported ? 'Поделиться' : 'Копировать ссылку'}
      data-testid="share-button"
    />
  );
};
