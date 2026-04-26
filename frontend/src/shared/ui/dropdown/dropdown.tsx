import styles from './dropdown.module.css';
import { useState, useRef, useEffect, useCallback } from 'react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  position = 'bottom-right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => setIsOpen(false), []);
  const toggleDropdown = useCallback(() => setIsOpen(prev => !prev), []);

  // Оптимизированная обработка событий
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    // Используем capture phase для лучшей производительности
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('keydown', handleEscape, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleEscape, true);
    };
  }, [isOpen, closeDropdown]);

  // Оптимизированный обработчик клика по элементу
  const handleItemClick = useCallback(
    (onClick: () => void) => {
      return () => {
        onClick();
        closeDropdown();
      };
    },
    [closeDropdown],
  );

  return (
    <div className={`${styles.dropdown} ${className}`} ref={dropdownRef}>
      <div
        onClick={toggleDropdown}
        className={styles.trigger}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDropdown();
          }
        }}
      >
        {trigger}
      </div>

      {isOpen && (
        <div className={`${styles.menu} ${styles[position]}`} role="menu">
          <ul className={styles.menuList} role="none">
            {items.map(item => (
              <li key={item.id} className={styles.menuItem} role="none">
                <button
                  className={styles.menuButton}
                  onClick={handleItemClick(item.onClick)}
                  role="menuitem"
                  tabIndex={-1}
                >
                  {item.icon && <span className={styles.menuIcon}>{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
