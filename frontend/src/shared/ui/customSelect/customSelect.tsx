import { useClickOutside } from '@/shared/hooks/useClickOutside';
import styles from './customSelect.module.css';
import { forwardRef, useRef, useState } from 'react';

type CustomSelectProps = {
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  className: string;
  id: string;
  title: string;
  value?: string;
  placeholder: string;
  onBlur?: () => void;
  onFocus?: () => void;
  error: string | undefined;
};

export const CustomSelect = forwardRef<HTMLDivElement, CustomSelectProps>(
  (
    { options, onChange, className, id, title, value, placeholder, onBlur, error, onFocus },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setFocusedIndex(null);
      onBlur?.();
    };
    useClickOutside(containerRef, () => {
      if (isOpen) {
        setIsOpen(false);
        setFocusedIndex(null);
        onBlur?.();
      }
    });

    // Навигация клавишами
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          setIsOpen(true);
          setFocusedIndex(0);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => {
          if (prev === null) return 0;
          return Math.min(prev + 1, options.length - 1);
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => {
          if (prev === null) return options.length - 1;
          return Math.max(prev - 1, 0);
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (focusedIndex !== null) {
          handleSelect(options[focusedIndex].value);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setFocusedIndex(null);
      }
    };

    return (
      <div className={`${styles.container} ${className}`}>
        <label className={styles.label} htmlFor={id}>
          {title}
        </label>
        <div
          className={`
            ${styles.wrapper} 
            ${isOpen ? styles.wrapperOpen : ''} 
            ${error ? styles.wrapperError : ''} 
            ${isOpen && error ? styles.wrapperOpenError : ''}
          `}
          ref={containerRef}
        >
          <div
            ref={ref}
            className={`
              ${styles.select} 
              ${isOpen ? styles.selectOpen : ''} 
              ${isOpen && error ? styles.selectOpenError : ''} 
              ${!value ? styles.selectHasPlaceholder : ''}
            `}
            onClick={() => {
              setIsOpen(prev => !prev);
              if (!isOpen) setFocusedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={isOpen}
            tabIndex={0}
            onFocus={onFocus}
          >
            {value ? options.find(opt => opt.value === value)?.label : placeholder}
          </div>

          {isOpen && (
            <ul className={styles.ul} role="listbox">
              {options.map((option, index) => {
                const isSelected = focusedIndex === index;
                return (
                  <li
                    key={option.value}
                    className={`${styles.li} ${isSelected ? styles.selected : ''}`}
                    role="option"
                    aria-selected={value === option.value}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    onMouseLeave={() => setFocusedIndex(null)}
                  >
                    {option.label}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {error && !isOpen && <span className={styles.error}>{error}</span>}
      </div>
    );
  },
);
