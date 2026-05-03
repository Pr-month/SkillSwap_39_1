import { describe, expect, it } from 'vitest';
import {
  createExchangeRequest,
  exchangeReducer,
  fetchExchanges,
  markAllAsRead,
  markRequestAsRead,
} from '../exchangeSlice';

const mockRequests = [
  {
    id: 'request-1',
    fromUserId: 'user-1',
    fromUserName: 'Алексей',
    toUserId: 'user-2',
    toUserName: 'Мария',
    offeredSkillId: 'skill-1',
    offeredSkillName: 'React',
    requestedSkillId: 'skill-2',
    requestedSkillName: 'Node.js',
    status: 'pending' as const,
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'request-2',
    fromUserId: 'user-3',
    fromUserName: 'Ирина',
    toUserId: 'user-2',
    toUserName: 'Мария',
    offeredSkillId: 'skill-3',
    offeredSkillName: 'Docker',
    requestedSkillId: 'skill-4',
    requestedSkillName: 'TypeScript',
    status: 'inProgress' as const,
    isRead: false,
    createdAt: new Date().toISOString(),
  },
];

describe('exchangeSlice', () => {
  it('возвращает пустое initial state без моков', () => {
    const state = exchangeReducer(undefined, { type: 'unknown' });

    expect(state.requests).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('обрабатывает fetchExchanges.pending', () => {
    const state = exchangeReducer(undefined, fetchExchanges.pending('request-id'));

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('обрабатывает fetchExchanges.fulfilled', () => {
    const state = exchangeReducer(
      undefined,
      fetchExchanges.fulfilled(mockRequests, 'request-id'),
    );

    expect(state.loading).toBe(false);
    expect(state.requests).toEqual(mockRequests);
  });

  it('обрабатывает fetchExchanges.rejected', () => {
    const state = exchangeReducer(
      undefined,
      fetchExchanges.rejected(
        new Error('boom'),
        'request-id',
        undefined,
        'Ошибка загрузки',
      ),
    );

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Ошибка загрузки');
  });

  it('обрабатывает createExchangeRequest.pending и rejected', () => {
    const pendingState = exchangeReducer(
      undefined,
      createExchangeRequest.pending('request-id', {
        offeredSkillId: 'skill-1',
        requestedSkillId: 'skill-2',
      }),
    );

    expect(pendingState.loading).toBe(true);

    const rejectedState = exchangeReducer(
      pendingState,
      createExchangeRequest.rejected(
        new Error('boom'),
        'request-id',
        {
          offeredSkillId: 'skill-1',
          requestedSkillId: 'skill-2',
        },
        'Не удалось отправить заявку',
      ),
    );

    expect(rejectedState.loading).toBe(false);
    expect(rejectedState.error).toBe('Не удалось отправить заявку');
  });

  it('обрабатывает markRequestAsRead.fulfilled', () => {
    const stateWithRequests = exchangeReducer(
      undefined,
      fetchExchanges.fulfilled(mockRequests, 'request-id'),
    );

    const nextState = exchangeReducer(
      stateWithRequests,
      markRequestAsRead.fulfilled('request-1', 'request-id', 'request-1'),
    );

    expect(nextState.requests[0].isRead).toBe(true);
    expect(nextState.requests[1].isRead).toBe(false);
  });

  it('обрабатывает markAllAsRead.fulfilled', () => {
    const stateWithRequests = exchangeReducer(
      undefined,
      fetchExchanges.fulfilled(mockRequests, 'request-id'),
    );

    const nextState = exchangeReducer(
      stateWithRequests,
      markAllAsRead.fulfilled(undefined, 'request-id', undefined),
    );

    expect(nextState.requests.every((request) => request.isRead)).toBe(true);
  });
});
