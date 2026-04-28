import { useState, useRef, useEffect, forwardRef } from 'react';
import { TextInput, TextInputProps } from '../textInput/textInput.tsx';
import styles from './autoComplete.module.css';
import { useClickOutside } from '@/shared/hooks/useClickOutside.ts';
import { useDebounce } from '@/shared/hooks/useDebounce.ts';

export type AutocompleteProps = Omit<TextInputProps, 'onChange'> & {
  suggestions: string[];
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  className?: string;
  error: string;
  value: string;
  onBlur?: (value: string) => void;
};

export const Autocomplete = forwardRef<HTMLInputElement, AutocompleteProps>(
  ({ suggestions, onChange, onSelect, value = '', className, onBlur, ...textInputProps }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectionMade, setSelectionMade] = useState(false);
    const debouncedInputValue = useDebounce(value, 300);

    useClickOutside(containerRef, () => setIsOpen(false));

    useEffect(() => {
      if (debouncedInputValue && !selectionMade) {
        const filtered = suggestions
          .filter(item => item.toLowerCase().includes(debouncedInputValue.toLowerCase()))
          .sort((a, b) => a.localeCompare(b));
        setFilteredSuggestions(filtered);
        setIsOpen(filtered.length > 0);
      } else {
        setFilteredSuggestions([]);
        setIsOpen(false);
      }
      setSelectedIndex(-1);
    }, [debouncedInputValue, suggestions, selectionMade]);

    const handleInputChange = (newValue: string) => {
      if (selectionMade) {
        setSelectionMade(false);
      }
      onChange?.(newValue);
    };

    const handleSelect = (suggestion: string) => {
      onChange?.(suggestion);
      onSelect?.(suggestion);
      setIsOpen(false);
      setSelectedIndex(-1);
      onBlur?.(suggestion);
      setSelectionMade(true);
    };

    const handleInputClick = () => {
      if (!selectionMade && filteredSuggestions.length > 0) {
        setIsOpen(true);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleSelect(filteredSuggestions[selectedIndex]);
          }
          break;

        case 'Escape':
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    };

    return (
      <div
        ref={containerRef}
        className={`${styles.container} ${className} ${isOpen ? styles.containerOpen : ''}`}
      >
        <div onKeyDown={handleKeyDown}>
          <TextInput
            {...textInputProps}
            ref={ref}
            value={value}
            onClick={handleInputClick}
            inputClassName={`${styles.wrapper} ${isOpen ? styles.wrapperOpen : ''}`}
            onChange={e => handleInputChange(e.target.value)}
            hideError={isOpen}
          />
        </div>

        {isOpen && (
          <ul className={styles.ul}>
            {filteredSuggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                className={`${styles.li} ${index === selectedIndex ? styles.selected : ''}`}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);
