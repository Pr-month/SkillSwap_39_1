import type { RootState } from '@/services/store/store';
import { RequestStatus } from '@/entities/auth/model/types';
import {
  selectExchageRequests,
  selectToUserExchangeRequest,
  selectFromUserExchangeRequest,
  selectNewRequests,
  selectViewedRequests,
  selectHasUnreadRequests,
} from '../exchangeSelectors';

const mockState: RootState = {
  register: {
    stepOneData: { email: '', password: '' },
    stepTwoData: {
      name: '',
      birthdate: '',
      gender: 'Мужской',
      city: 'Москва',
      categories: [],
      subcategories: [],
      avatar: '',
    },
    stepThreeData: {
      skillName: '',
      skillCategory: 'Бизнес и карьера',

      skillSubCategory: 'Проектное управление',
      description: '',
      images: [],
      customSkillId: '',
      subcategoryId: '',
      userId: '',
    },
    error: undefined,
    loading: false,
  },
  catalog: { users: [], loading: false, error: null, searchQuery: '' },
  exchange: {
    requests: [
      {
        id: '1',
        fromUserId: 'u1',
        fromUserName: 'A',
        toUserId: 'u2',
        isRead: false,
        createdAt: '',
        status: 'pending',
      },
      {
        id: '2',
        fromUserId: 'u2',
        fromUserName: 'B',
        toUserId: 'u1',
        isRead: true,
        createdAt: '',
        status: 'pending',
      },
      {
        id: '3',
        fromUserId: 'u1',
        fromUserName: 'A',
        toUserId: 'u3',
        isRead: false,
        createdAt: '',
        status: 'pending',
      },
    ],
    loading: false,
    error: null,
  },
  skills: { skills: [], loading: false, error: undefined },
  step: { currentStep: 0, totalSteps: 0 },
  filters: { mode: 'all', gender: 'any', city: [], skill: [] },
  likes: { likedItems: {}, loading: false, error: null },
  authUser: {
    data: {
      _id: 'u1',
      name: '',
      createdAt: '',
      image: '',
      city: '',
      gender: 'male',
      birthdayDate: '',
      description: '',
      likes: [],
      canTeach: {
        name: '',
        image: [],
        description: '',
        customSkillId: '',
        category: 'Бизнес и карьера',
        subcategory: 'Управление командой',
        subcategoryId: '',
      },
      wantsToLearn: [],
    },
    authStatus: RequestStatus.Idle,
    userCheck: false,
  },
};

describe('exchangeSelectors', () => {
  describe('Обработка отсутствующего authUser или _id', () => {
    test('selectToUserExchangeRequest возвращает [] если authUser.data отсутствует или _id пуст', () => {
      const stateWithoutData: RootState = {
        ...mockState,
        authUser: { ...mockState.authUser, data: null },
      };
      const stateWithEmptyId: RootState = {
        ...mockState,
        authUser: { ...mockState.authUser, data: { ...mockState.authUser.data!, _id: '' } },
      };
      expect(selectToUserExchangeRequest(stateWithoutData)).toEqual([]);
      expect(selectToUserExchangeRequest(stateWithEmptyId)).toEqual([]);
    });
    test('selectFromUserExchangeRequest возвращает [] если authUser.data отсутствует или _id пуст', () => {
      const stateWithoutData: RootState = {
        ...mockState,
        authUser: { ...mockState.authUser, data: null },
      };
      const stateWithEmptyId: RootState = {
        ...mockState,
        authUser: { ...mockState.authUser, data: { ...mockState.authUser.data!, _id: '' } },
      };
      expect(selectFromUserExchangeRequest(stateWithoutData)).toEqual([]);
      expect(selectFromUserExchangeRequest(stateWithEmptyId)).toEqual([]);
    });
  });

  describe('Базовые селекторы', () => {
    test('selectExchageRequests возвращает все заявки', () => {
      expect(selectExchageRequests(mockState)).toHaveLength(3);
    });
    test('selectToUserExchangeRequest возвращает заявки, где пользователь — получатель', () => {
      expect(selectToUserExchangeRequest(mockState)).toEqual([mockState.exchange.requests[1]]);
    });
    test('selectFromUserExchangeRequest возвращает заявки, где пользователь — отправитель', () => {
      expect(selectFromUserExchangeRequest(mockState)).toEqual([
        mockState.exchange.requests[0],
        mockState.exchange.requests[2],
      ]);
    });
  });

  describe('Фильтрация по статусу прочтения', () => {
    test('selectNewRequests возвращает только непрочитанные заявки', () => {
      expect(selectNewRequests(mockState)).toEqual([
        mockState.exchange.requests[0],
        mockState.exchange.requests[2],
      ]);
    });
    test('selectViewedRequests возвращает только прочитанные заявки', () => {
      expect(selectViewedRequests(mockState)).toEqual([mockState.exchange.requests[1]]);
    });
    test('selectHasUnreadRequests возвращает true, если есть непрочитанные заявки', () => {
      expect(selectHasUnreadRequests(mockState)).toBe(true);
    });
    test('selectHasUnreadRequests возвращает false, если все заявки прочитаны', () => {
      const state: RootState = {
        ...mockState,
        exchange: {
          requests: [
            {
              id: '1',
              fromUserId: 'u1',
              fromUserName: 'A',
              toUserId: 'u2',
              isRead: true,
              createdAt: '',
              status: 'pending',
            },
          ],
          loading: false,
          error: null,
        },
      };
      expect(selectHasUnreadRequests(state)).toBe(false);
    });
  });
});
