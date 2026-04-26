import { RootState } from '@/services/store/store';

export const selectCatalogItems = (state: RootState) => state.catalog.users;
export const selectCatalogLoading = (state: RootState) => state.catalog.loading;
