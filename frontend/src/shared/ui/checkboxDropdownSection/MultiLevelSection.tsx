import { useCallback, useState } from 'react';
import { CategoryItem } from './CategoryItem';
import styles from './checkboxDropdownSection.module.css';
import { CheckboxMask } from '../сheckbox/type';

interface MultiLevelSectionProps {
  visibleCategories: string[];
  categories: Record<string, readonly string[]>;
  selectedCategories: string[];
  selectedSubcategories: string[];
  onCategoryChange: (categories: string[]) => void;
  onSubcategoryChange: (subcategories: string[]) => void;
  isSimpleList?: boolean;
}

export const MultiLevelSection: React.FC<MultiLevelSectionProps> = ({
  visibleCategories,
  categories,
  selectedCategories,
  selectedSubcategories,
  onCategoryChange,
  onSubcategoryChange,
  isSimpleList = false,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const getCustomCheckboxMask = useCallback(
    (item: string) => {
      if (isSimpleList) {
        // Для простого списка
        return selectedCategories.includes(item) ? CheckboxMask.DONE : CheckboxMask.EMPTY;
      } else {
        // Для многоуровневого списка
        const isSubcategory = Object.values(categories).flat().includes(item);

        if (isSubcategory) {
          return selectedSubcategories.includes(item) ? CheckboxMask.DONE : CheckboxMask.EMPTY;
        } else {
          const subcategories = categories[item] || [];
          const allSelected = subcategories.every(sub => selectedSubcategories.includes(sub));
          const someSelected = subcategories.some(sub => selectedSubcategories.includes(sub));

          return allSelected
            ? CheckboxMask.DONE
            : someSelected
              ? CheckboxMask.REMOVE
              : CheckboxMask.EMPTY;
        }
      }
    },
    [categories, selectedCategories, selectedSubcategories, isSimpleList],
  );

  const toggleCategory = useCallback(
    (category: string) => {
      const subcategories = categories[category] || [];
      const isSelected = selectedCategories.includes(category);

      const newCategories = isSelected
        ? selectedCategories.filter(c => c !== category)
        : [...selectedCategories, category];

      const newSubcategories = isSelected
        ? selectedSubcategories.filter(sub => !subcategories.includes(sub))
        : [...new Set([...selectedSubcategories, ...subcategories])];

      onCategoryChange(newCategories);
      if (!isSimpleList) {
        onSubcategoryChange(newSubcategories);
      }
    },
    [
      categories,
      selectedCategories,
      selectedSubcategories,
      onCategoryChange,
      onSubcategoryChange,
      isSimpleList,
    ],
  );

  const handleChevronClick = (category: string) => {
    setExpandedCategories(prev => {
      const isExpanded = prev.includes(category);
      const newState = isExpanded ? prev.filter(c => c !== category) : [...prev, category];

      return newState;
    });
  };

  return (
    <>
      {visibleCategories.map(category => (
        <div
          key={category}
          className={`${styles.categoryItem} ${
            expandedCategories.includes(category) ? styles.expanded : ''
          }`}
        >
          <CategoryItem
            category={category}
            checked={selectedCategories.includes(category)}
            onChange={() => toggleCategory(category)}
            customCheckboxMask={getCustomCheckboxMask(category)}
            withChevron={!isSimpleList}
            onChevronClick={() => handleChevronClick(category)}
          />

          {!isSimpleList && expandedCategories.includes(category) && (
            <div className={styles.subcategories}>
              {(categories[category] || []).map(subcategory => (
                <CategoryItem
                  key={subcategory}
                  category={subcategory}
                  checked={selectedSubcategories.includes(subcategory)}
                  customCheckboxMask={getCustomCheckboxMask(subcategory)}
                  onChange={() =>
                    onSubcategoryChange(
                      selectedSubcategories.includes(subcategory)
                        ? selectedSubcategories.filter(s => s !== subcategory)
                        : [...selectedSubcategories, subcategory],
                    )
                  }
                  onChevronClick={() => {
                    handleChevronClick(category);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
};
