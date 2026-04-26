import { useState } from 'react';
import { MultiLevelSection } from './MultiLevelSection';
import styles from './checkboxDropdownSection.module.css';
import { TOGGLE_TEXTS } from './constants';

interface CheckboxDropdownSectionProps {
  title: string;
  categories: Record<string, readonly string[]> | readonly string[];
  selectedCategories: string[];
  selectedSubcategories?: string[];
  onCategoryChange: (categories: string[]) => void;
  onSubcategoryChange?: (subcategories: string[]) => void;
  isSimpleList?: boolean;
}

export const CheckboxDropdownSection: React.FC<CheckboxDropdownSectionProps> = ({
  title,
  categories,
  selectedCategories,
  selectedSubcategories = [],
  onCategoryChange,
  onSubcategoryChange,
  isSimpleList = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const config = TOGGLE_TEXTS[title] || {
    expand: 'Все категории',
    collapse: 'Свернуть',
    defaultVisibleItems: 5,
  };
  const { expand, collapse, defaultVisibleItems } = config;

  // Проверка на обязательность пропа при isSimpleList === false
  if (!isSimpleList && !onSubcategoryChange) {
    throw new Error(
      'Проп onSubcategoryChange обязателен для многоуровневого списка (isSimpleList === false)',
    );
  }

  // Преобразуем данные к единому формату
  const normalizedCategories =
    isSimpleList && Array.isArray(categories)
      ? Object.fromEntries(categories.map(c => [c, []]))
      : categories;
  const categoryKeys = Object.keys(normalizedCategories);

  const visibleCategories = expanded ? categoryKeys : categoryKeys.slice(0, defaultVisibleItems);

  return (
    <div className={styles.filterSection}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.checkboxDropdown}>
        <MultiLevelSection
          visibleCategories={visibleCategories}
          categories={normalizedCategories}
          selectedCategories={selectedCategories}
          selectedSubcategories={selectedSubcategories}
          onCategoryChange={onCategoryChange}
          onSubcategoryChange={onSubcategoryChange as (subcategories: string[]) => void}
          isSimpleList={isSimpleList}
        />

        {defaultVisibleItems > 0 && categoryKeys.length > defaultVisibleItems && (
          <button
            className={styles.showMoreContainer}
            onClick={() => setExpanded(!expanded)}
            type="button"
          >
            {expanded ? collapse : expand}
            <span className={`${styles.chevron} ${expanded ? styles.rotated : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
};
