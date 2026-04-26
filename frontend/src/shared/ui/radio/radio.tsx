import React from 'react';
import styles from './radio.module.css';

interface RadioProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}

export const RadioUI: React.FC<RadioProps> = ({ id, name, checked, onChange, label }) => {
  return (
    <div className={styles.radioContainer}>
      <input
        type="radio"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        className={styles.hiddenRadio}
      />
      <label htmlFor={id} className={styles.customRadio}>
        <span className={styles.radioDot} />
        <span className={styles.labelText}>{label}</span>
      </label>
    </div>
  );
};
