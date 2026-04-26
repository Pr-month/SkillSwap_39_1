import { describe, test, expect } from 'vitest';
import {
  selectLikedItems,
  selectLikesLoading,
  selectLikesError,
  selectIsLiked,
} from '../likeSelectors';
import type { RootState } from '@/services/store/store';
import { RequestStatus } from '@/entities/auth/model/types';

const mockState: RootState = {
  register: {
    stepOneData: { email: undefined, password: undefined },
    stepTwoData: {
      name: undefined,
      birthdate: undefined,
      gender: undefined,
      city: undefined,
      categories: undefined,
      subcategories: undefined,
      avatar: undefined,
    },
    stepThreeData: {
      skillName: undefined,
      skillCategory: undefined,
      skillSubCategory: undefined,
      description: undefined,
      images: [],
      customSkillId: undefined,
      subcategoryId: undefined,
      userId: undefined,
    },
    error: undefined,
    loading: false,
  },
  catalog: { users: [], loading: false, error: null, searchQuery: '' },
  exchange: { requests: [], loading: false, error: null },
  skills: { skills: [], loading: false, error: undefined },
  step: { currentStep: 1, totalSteps: 1 },
  filters: { mode: 'all', gender: 'any', city: [], skill: [] },
  likes: { likedItems: { 'item-1': true, 'item-2': false }, loading: true, error: 'Ошибка' },
  authUser: { data: null, authStatus: RequestStatus.Idle, userCheck: false },
};

describe('likeSelectors', () => {
  test('selectLikedItems возвращает likedItems', () => {
    expect(selectLikedItems(mockState)).toEqual({ 'item-1': true, 'item-2': false });
  });
  test('selectLikesLoading возвращает loading', () => {
    expect(selectLikesLoading(mockState)).toBe(true);
  });
  test('selectLikesError возвращает error', () => {
    expect(selectLikesError(mockState)).toBe('Ошибка');
  });
  test('selectIsLiked возвращает true для лайкнутого', () => {
    expect(selectIsLiked(mockState, 'item-1')).toBe(true);
  });
  test('selectIsLiked возвращает false для не лайкнутого', () => {
    expect(selectIsLiked(mockState, 'item-2')).toBe(false);
  });
  test('selectIsLiked возвращает false для отсутствующего id', () => {
    expect(selectIsLiked(mockState, 'item-3')).toBe(false);
  });
});
