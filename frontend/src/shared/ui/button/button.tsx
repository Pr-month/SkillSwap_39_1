import React from 'react';
import styles from './button.module.css';

export type TButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
};

export const Button: React.FC<TButtonProps> = ({
  children,
  onClick,
  disabled = false,
  type = 'primary',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onClick?.();
    e.currentTarget.blur();
  };

  const buttonClasses = `${styles.button} ${styles[type]} ${disabled ? styles.disabled : ''}`;

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      <span className={styles.content}>{children}</span>
    </button>
  );
};
