import React from 'react';
import { RadioUI } from '../radio/radio';
import styles from './radioGroupSection.module.css';

interface RadioGroupSectionProps {
  title: string;
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export const RadioGroupSection: React.FC<RadioGroupSectionProps> = ({
  title,
  options,
  selectedValue,
  onChange,
}) => {
  return (
    <div className={styles.radioGroupSection}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.radioOptions}>
        {options.map(option => (
          <RadioUI
            key={option.value}
            id={`radio-${option.value}`}
            name={option.label || 'radio-group'}
            checked={selectedValue === option.value}
            onChange={() => onChange(option.value)}
            label={option.label}
          />
        ))}
      </div>
    </div>
  );
};
