import { useCallback } from 'react';

import { addRequest } from '@/services/slices/exchangeSlice';
import { useDispatch, useSelector } from '@/services/store/store';

export const useExchange = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.authUser.data);
  const exchangeRequests = useSelector(state => state.exchange.requests);

  // Мемоизированная функция для проверки заявок
  const hasSentRequest = useCallback(
    (toUserId: string) => {
      if (!currentUser) return false;
      return exchangeRequests.some(
        req => req.fromUserId === currentUser._id && req.toUserId === toUserId,
      );
    },
    [currentUser, exchangeRequests],
  );

  const sendExchangeRequest = useCallback(
    (toUserId: string) => {
      if (!currentUser) {
        throw new Error('Cannot send request: user not authenticated');
      }

      const newRequest = {
        fromUserId: currentUser._id,
        fromUserName: currentUser.name,
        toUserId,
        isRead: false,
        createdAt: new Date().toISOString(),
        id: `req_${Date.now()}`,
      };

      dispatch(addRequest(newRequest));

      return newRequest;
    },
    [currentUser, dispatch],
  );

  return {
    sendExchangeRequest,
    hasSentRequest,
  };
};
