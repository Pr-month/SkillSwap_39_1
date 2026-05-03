import { RootState } from '@/services/store/store';

export const selectCatalogItems = (state: RootState) => state.catalog.users;
export const selectCatalogLoading = (state: RootState) => state.catalog.loading;
export const selectCatalogUserById = (state: RootState, userId: string) =>
  state.catalog.users.find(user => user._id === userId);
