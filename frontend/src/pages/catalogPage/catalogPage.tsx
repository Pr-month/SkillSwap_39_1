import React from 'react';
import { FiltersPanel } from '@/widgets/filters-panel/filtersPanel';
import styles from './catalogPage.module.css';
import { skillsCategories } from '@/shared/lib/categories';
import { cities } from '@/shared/lib/cities';
import SelectedFilters from '@/shared/ui/selectedFilters/selectedFilters';
import Catalog from '@/widgets/catalog/catalog';
import RequestPanel from '@/widgets/requestPanel/requestPanel';
import { useSelector } from '@/services/store/store';
import { userSliceSelectors } from '@/services/slices/authSlice';

export const CatalogPage: React.FC = () => {
  // Получаем данные пользователя из Redux
  const user = useSelector(userSliceSelectors.selectUser);

  // isAuthenticated = true, если user не null
  const isAuthenticated = Boolean(user);

  return (
    <div className={styles.filtersPage}>
      <div className={styles.filtersPanelPontainer}>
        <FiltersPanel skillsCategories={skillsCategories} cities={cities} />
        {isAuthenticated && <RequestPanel />}
      </div>

      <div className={styles.filtersGrid}>
        <SelectedFilters />
        <Catalog isAuthenticated={isAuthenticated} isFiltered={false} />
      </div>
    </div>
  );
};
