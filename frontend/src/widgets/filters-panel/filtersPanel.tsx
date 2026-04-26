import { useMemo, useState } from 'react';
import { RadioGroupSection } from '@/shared/ui/radioGroupSection/radioGroupSection';
import { CheckboxDropdownSection } from '@/shared/ui//checkboxDropdownSection/checkboxDropdownSection';
import { experienceOptions, genderOptions } from './constants';
import { SkillsCategories, City } from './types';
import styles from './filtersPanel.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/services/store/store';
import {
  setMode,
  setGender,
  setCities,
  setSkills,
  resetFilters,
} from '@/services/slices/filtersSlice';
import { setSearchQuery } from '@/services/slices/catalogSlice';

interface FiltersPanelProps {
  skillsCategories: SkillsCategories;
  cities: City;
}

export const FiltersPanel = ({ skillsCategories, cities }: FiltersPanelProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const dispatch = useDispatch();
  const { mode, gender, city, skill } = useSelector((state: RootState) => state.filters);
  const searchQuery = useSelector((state: RootState) => {
    const query = state.catalog.searchQuery;
    return query && query.trim() ? query : null;
  });

  // Вычисляем количество активных фильтров
  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (mode !== 'all') count++;
    if (gender !== 'any') count++;
    count += skill.length;
    count += city.length;

    return count;
  }, [mode, gender, skill, city]);

  const handleReset = () => {
    dispatch(resetFilters());
    dispatch(setSearchQuery(''));
  };

  // Типизированные обработчики
  const handleModeChange = (value: string) => {
    const validValue = experienceOptions.find(opt => opt.value === value)?.value;
    if (validValue) {
      dispatch(setMode(validValue));
    }
  };

  const handleGenderChange = (value: string) => {
    const validValue = genderOptions.find(opt => opt.value === value)?.value;
    if (validValue) {
      dispatch(setGender(validValue));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Фильтры {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </h2>
        {(activeFiltersCount > 0 || searchQuery) && (
          <button onClick={handleReset} className={styles.resetButton} type="button">
            Сбросить
          </button>
        )}
      </div>
      <div className={styles.section}>
        <RadioGroupSection
          title=""
          options={experienceOptions}
          selectedValue={mode}
          onChange={handleModeChange}
        />

        <CheckboxDropdownSection
          title="Навыки"
          categories={skillsCategories}
          selectedCategories={selectedCategories}
          selectedSubcategories={skill}
          onCategoryChange={setSelectedCategories}
          onSubcategoryChange={skills => dispatch(setSkills(skills))}
        />

        <RadioGroupSection
          title="Пол автора"
          options={genderOptions}
          selectedValue={gender}
          onChange={handleGenderChange}
        />

        <CheckboxDropdownSection
          title="Город"
          categories={cities}
          selectedCategories={city}
          onCategoryChange={cities => dispatch(setCities(cities))}
          isSimpleList={true}
        />
      </div>
    </div>
  );
};
