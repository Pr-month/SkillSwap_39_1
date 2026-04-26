import styles from './SearchInput.module.css';
import { ChangeEvent, useState, useEffect } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';

type SearchInputProps = {
  placeholder?: string;
  value: string;
  onSearch: (query: string) => void;
};

export const SearchInput = ({ placeholder, value, onSearch }: SearchInputProps) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);

  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value, localValue]);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchIcon}></div>
      <input
        type="text"
        placeholder={placeholder}
        className={styles.input}
        value={localValue}
        onChange={handleChange}
      />
    </div>
  );
};
