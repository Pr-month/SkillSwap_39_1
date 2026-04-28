import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/services/store/store';

export const selectLikedItems = (state: RootState) => state.likes.likedItems;
export const selectLikesLoading = (state: RootState) => state.likes.loading;
export const selectLikesError = (state: RootState) => state.likes.error;

export const selectIsLiked = createSelector(
  [selectLikedItems, (_, itemId: string) => itemId],
  (likedItems, itemId) => likedItems[itemId] || false,
);
