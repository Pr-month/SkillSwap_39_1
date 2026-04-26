import { RootState } from '@/services/store/store';
import { createSelector } from '@reduxjs/toolkit';

export const selectExchageRequests = (state: RootState) => state.exchange.requests;

export const selectToUserExchangeRequest = createSelector(
  [selectExchageRequests, (state: RootState) => state.authUser.data?._id],
  (requests, currentUserId) => {
    if (!currentUserId) return [];
    return requests.filter(req => req.toUserId === currentUserId);
  },
);

export const selectFromUserExchangeRequest = createSelector(
  [selectExchageRequests, (state: RootState) => state.authUser.data?._id],
  (requests, currentUserId) => {
    if (!currentUserId) return [];
    return requests.filter(req => req.fromUserId === currentUserId);
  },
);

export const selectNewRequests = createSelector([selectExchageRequests], requests =>
  requests.filter(req => !req.isRead),
);

export const selectViewedRequests = createSelector([selectExchageRequests], requests =>
  requests.filter(req => req.isRead),
);

export const selectHasUnreadRequests = createSelector(
  [selectNewRequests],
  newRequests => newRequests.length > 0,
);
