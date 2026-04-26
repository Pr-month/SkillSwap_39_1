import { forwardRef } from 'react';
import styles from './textInput.module.css';

export type TextInputProps = {
  className?: string;
  icon?: string;
  id: string;
  title: string;
  placeholder: string;
  onClick?: () => void;
  onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  onFocus?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  error?: string | undefined;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url' | 'date' | 'textarea';
  inputClassName?: string;
  hideError?: boolean; // задаем зависимость чтобы убрать ошибку, если инпут используется в компонентах с дропдауном
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      id,
      title,
      placeholder,
      className,
      icon,
      error,
      type,
      inputClassName,
      onChange,
      value,
      hideError,
      ...rest
    },
    ref,
  ) => {
    const isTextarea = type === 'textarea';
    return (
      <div className={`${styles.container} ${className}`}>
        <label className={styles.label} htmlFor={id}>
          {title}
        </label>
        {isTextarea ? (
          <textarea
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            value={value}
            onChange={onChange}
            className={`${styles.input} ${!hideError && error ? styles.inputError : ''} ${inputClassName}`}
            id={id}
            placeholder={placeholder}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            rows={3}
          />
        ) : (
          <input
            {...rest}
            value={value}
            type={type}
            onChange={onChange}
            className={`${styles.input} ${icon ? styles.inputWithIcon : ''} ${!hideError && error ? styles.inputError : ''} ${inputClassName}`}
            id={id}
            placeholder={placeholder}
            ref={ref as React.Ref<HTMLInputElement>}
            style={icon ? { backgroundImage: `url(${icon})` } : undefined}
          />
        )}
        {!hideError && error && <span className={styles.error}>{error}</span>}
      </div>
    );
  },
);
