import React, { ChangeEvent } from 'react';
import styles from './checkbox.module.css';
import { CustomCheckboxMask } from './type';

export interface CheckboxUiProps {
  // Базовые пропсы input
  id: string;
  checked: boolean;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;

  // Визуальное состояние
  label: string;
  customCheckboxMask?: CustomCheckboxMask;

  // Обработчики
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onLabelClick?: (e: React.MouseEvent) => void;

  // ARIA-атрибуты
  ariaLabel?: string;
  ariaLabelledby?: string;
  role?: string;
}

export const CheckboxUI: React.FC<CheckboxUiProps> = ({
  id,
  name,
  checked,
  disabled = false,
  readOnly = false,
  label,
  customCheckboxMask = 'empty',
  onChange,
  onLabelClick,
  ariaLabel,
  ariaLabelledby,
  role = 'checkbox',
}) => {
  return (
    <div className={styles.checkboxContainer}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        disabled={disabled}
        readOnly={readOnly}
        onChange={onChange}
        className={styles.hiddenCheckbox}
        aria-label={ariaLabel || label}
        aria-labelledby={ariaLabelledby}
        role={role}
      />
      <label htmlFor={id} className={`${styles.customCheckbox} ${styles[customCheckboxMask]}`}>
        <span className={styles.checkmark} />
        <span className={styles.labelText} onClick={onLabelClick}>
          {label}
        </span>
      </label>
    </div>
  );
};
