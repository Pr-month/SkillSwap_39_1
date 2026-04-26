import { ChangeEvent } from 'react';
import { Button } from '@/shared/ui/button/button';
import styles from './PasswordChangeForm.module.css';

interface PasswordChangeFormProps {
  passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  passwordErrors: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    form: string;
  };
  showPassword: boolean;
  isLoading: boolean;
  onPasswordChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onTogglePasswordVisibility: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function PasswordChangeForm({
  passwordData,
  passwordErrors,
  showPassword,
  isLoading,
  onPasswordChange,
  onTogglePasswordVisibility,
  onSubmit,
  onCancel,
}: PasswordChangeFormProps) {
  return (
    <div className={styles.passwordChangeBlock}>
      <div className={styles.profileInputBlock}>
        <label className={styles.label}>Текущий пароль</label>
        <div className={styles.inputWrapper}>
          <input
            type={showPassword ? 'text' : 'password'}
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={onPasswordChange}
            className={`${styles.input} ${passwordErrors.currentPassword ? styles.inputError : ''}`}
            placeholder="Введите текущий пароль"
          />
          <button
            type="button"
            className={styles.toggleButton}
            onClick={onTogglePasswordVisibility}
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            <span className={showPassword ? styles.eyeOpen : styles.eyeClosed} />
          </button>
        </div>
        {passwordErrors.currentPassword && (
          <div className={styles.errorText}>{passwordErrors.currentPassword}</div>
        )}
      </div>

      <div className={styles.profileInputBlock}>
        <label className={styles.label}>Новый пароль</label>
        <div className={styles.inputWrapper}>
          <input
            type={showPassword ? 'text' : 'password'}
            name="newPassword"
            value={passwordData.newPassword}
            onChange={onPasswordChange}
            className={`${styles.input} ${passwordErrors.newPassword ? styles.inputError : ''}`}
            placeholder="Введите новый пароль"
          />
          <button
            type="button"
            className={styles.toggleButton}
            onClick={onTogglePasswordVisibility}
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            <span className={showPassword ? styles.eyeOpen : styles.eyeClosed} />
          </button>
        </div>
        {passwordErrors.newPassword && (
          <div className={styles.errorText}>{passwordErrors.newPassword}</div>
        )}
      </div>

      <div className={styles.profileInputBlock}>
        <label className={styles.label}>Подтвердите пароль</label>
        <div className={styles.inputWrapper}>
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={onPasswordChange}
            className={`${styles.input} ${passwordErrors.confirmPassword ? styles.inputError : ''}`}
            placeholder="Повторите новый пароль"
          />
          <button
            type="button"
            className={styles.toggleButton}
            onClick={onTogglePasswordVisibility}
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            <span className={showPassword ? styles.eyeOpen : styles.eyeClosed} />
          </button>
        </div>
        {passwordErrors.confirmPassword && (
          <div className={styles.errorText}>{passwordErrors.confirmPassword}</div>
        )}
      </div>

      {passwordErrors.form && <div className={styles.errorText}>{passwordErrors.form}</div>}

      <div className={styles.buttonsContainer}>
        <Button
          type="primary"
          onClick={onSubmit}
          disabled={
            !passwordData.currentPassword ||
            !passwordData.newPassword ||
            !passwordData.confirmPassword ||
            isLoading
          }
        >
          {isLoading ? 'Сохранение...' : 'Сохранить пароль'}
        </Button>
        <Button type="secondary" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </div>
  );
}
