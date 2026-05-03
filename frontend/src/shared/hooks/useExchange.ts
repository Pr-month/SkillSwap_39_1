import { useCallback } from 'react';

import { createExchangeRequest } from '@/services/slices/exchangeSlice';
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
        req =>
          req.fromUserId === currentUser._id &&
          req.toUserId === toUserId &&
          req.status !== 'rejected' &&
          req.status !== 'done',
      );
    },
    [currentUser, exchangeRequests],
  );

  const sendExchangeRequest = useCallback(
    async ({
      toUserId,
      requestedSkillId,
    }: {
      toUserId: string;
      requestedSkillId: string;
    }) => {
      if (!currentUser) {
        throw new Error('Cannot send request: user not authenticated');
      }

      const offeredSkillId = currentUser.canTeach?.customSkillId;

      if (!offeredSkillId) {
        throw new Error('Сначала добавьте свой навык, чтобы предложить обмен');
      }

      await dispatch(
        createExchangeRequest({
          offeredSkillId,
          requestedSkillId,
        }),
      ).unwrap();

      return {
        fromUserId: currentUser._id,
        toUserId,
        offeredSkillId,
        requestedSkillId,
      };
    },
    [currentUser, dispatch],
  );

  return {
    sendExchangeRequest,
    hasSentRequest,
  };
};
