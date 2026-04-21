import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/services/store/store';
import { removeFilter } from '@/services/slices/filtersSlice';
import styles from './selectedFilters.module.css';

type FilterType = 'mode' | 'gender' | 'city' | 'skill';

const SelectedFilters = () => {
  const dispatch = useDispatch();
  const { mode, gender, city, skill } = useSelector((state: RootState) => state.filters);

  const handleRemove = (type: FilterType, value?: string) => {
    dispatch(removeFilter({ type, value }));
  };

  // Формируем массив активных фильтров
  const activeFilters = [
    mode !== 'all' && {
      type: 'mode',
      value: mode,
      label: `${mode === 'can-teach' ? 'Могу научить' : 'Хочу научиться'}`,
    },

    gender !== 'any' && {
      type: 'gender',
      value: gender,
      label: `Пол: ${gender === 'male' ? 'Мужской' : 'Женский'}`,
    },

    ...city.map(c => ({
      type: 'city',
      value: c,
      label: c,
    })),

    ...skill.map(s => ({
      type: 'skill',
      value: s,
      label: s,
    })),
  ].filter((filter): filter is { type: FilterType; value: string; label: string } =>
    Boolean(filter),
  );

  if (activeFilters.length === 0) return null;

  return (
    <div className={styles.container}>
      {activeFilters.map(filter => (
        <div key={`${filter.type}-${filter.value}`} className={styles.filterTag}>
          <span>{filter.label}</span>
          <button
            onClick={() => handleRemove(filter.type, filter.value)}
            className={styles.removeButton}
            aria-label={`Удалить фильтр ${filter.label}`}
          ></button>
        </div>
      ))}
    </div>
  );
};

export default React.memo(SelectedFilters);
