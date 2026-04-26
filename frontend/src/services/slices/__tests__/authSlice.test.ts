import { describe, it, expect } from 'vitest';
import authSlice, { initialState } from '../authSlice';
import { RequestStatus } from '@/entities/auth/model/types';
import { User } from '@/entities/user/model/types';
import { userSliceActions } from '../authSlice';

// Используем реальные данные из usersData
import { usersData } from '@/shared/mocks/usersData';

// Берём первого пользователя как mockUser
const mockUser: User = usersData[0];

const mockAuthResponse = {
  user: mockUser,
  accessToken: 'token123',
  refreshToken: 'refresh123',
};

describe('authSlice', () => {
  it('should return the initial state', () => {
    const state = authSlice.reducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  describe('extraReducers', () => {
    it('should handle fetchUser.pending', () => {
      const action = {
        type: 'authUser/fetchUser/pending',
        meta: { requestId: '1', arg: undefined },
      };
      const state = authSlice.reducer(initialState, action);
      expect(state.authStatus).toBe(RequestStatus.Loading);
      expect(state.userCheck).toBe(false);
    });

    it('should handle fetchUser.fulfilled', () => {
      const action = {
        type: 'authUser/fetchUser/fulfilled',
        payload: {
          user: mockUser,
          tokens: {
            accessToken: 'test-access',
            refreshToken: 'test-refresh',
          },
        },
        meta: { requestId: '1', arg: undefined },
      };

      const state = authSlice.reducer(initialState, action);

      expect(state.data).toBeDefined();
      if (state.data) {
        expect(state.data._id).toBe(mockUser._id);
        expect(state.data.name).toBe(mockUser.name);
        expect(typeof state.data.image).toBe('string');

        // Проверяем canTeach
        expect(state.data.canTeach.name).toBe(mockUser.canTeach.name);
        expect(Array.isArray(state.data.canTeach.image)).toBe(true);
        expect(state.data.canTeach.category).toBe(mockUser.canTeach.category);
        expect(state.data.canTeach.subcategory).toBe(mockUser.canTeach.subcategory);
        expect(state.data.canTeach.customSkillId).toBe(mockUser.canTeach.customSkillId);

        // Проверяем wantsToLearn
        const want = state.data.wantsToLearn[0];
        expect(want.name).toBe(mockUser.wantsToLearn[0].name);
        expect(want.category).toBe(mockUser.wantsToLearn[0].category);
        expect(want.subcategory).toBe(mockUser.wantsToLearn[0].subcategory);
        expect(want.customSkillId).toBe(mockUser.wantsToLearn[0].customSkillId);
        expect(want).not.toHaveProperty('description');
        expect(want).not.toHaveProperty('image');
      }

      expect(state.authStatus).toBe(RequestStatus.Success);
      expect(state.userCheck).toBe(true);
    });

    it('should handle fetchUser.rejected', () => {
      const action = {
        type: 'authUser/fetchUser/rejected',
        error: { message: 'Error' },
        meta: { requestId: '1', arg: undefined },
      };
      const state = authSlice.reducer(initialState, action);
      expect(state.authStatus).toBe(RequestStatus.Failed);
      expect(state.userCheck).toBe(true);
      expect(state.data).toBeNull();
    });

    it('should handle loginUser.fulfilled', () => {
      const action = {
        type: 'authUser/loginUser/fulfilled',
        payload: mockAuthResponse,
        meta: { requestId: '1', arg: {} },
      };
      const state = authSlice.reducer(initialState, action);

      expect(state.data).toBeDefined();
      if (state.data) {
        expect(state.data._id).toBe(mockUser._id);
        expect(state.data.name).toBe(mockUser.name);

        expect(state.data.canTeach.name).toBe(mockUser.canTeach.name);
        expect(state.data.canTeach.category).toBe(mockUser.canTeach.category);
        expect(state.data.canTeach.customSkillId).toBe(mockUser.canTeach.customSkillId);
      }

      expect(state.authStatus).toBe(RequestStatus.Success);
      expect(state.userCheck).toBe(true);
    });

    it('should handle logoutUserApi.fulfilled', () => {
      const stateWithUser = {
        ...initialState,
        mockUser,
        authStatus: RequestStatus.Success,
        userCheck: true,
      };
      const action = {
        type: 'authUser/logoutUserApi/fulfilled',
        payload: undefined,
        meta: { requestId: '1', arg: undefined },
      };
      const state = authSlice.reducer(stateWithUser, action);
      expect(state.data).toBeNull();
      expect(state.authStatus).toBe(RequestStatus.Success);
      expect(state.userCheck).toBe(true);
    });
  });

  describe('reducers', () => {
    it('should handle setUserData', () => {
      const updatedUser: User = {
        ...mockUser,
        name: 'Updated Name',
        city: 'Tokyo',
        description: 'Updated description',
      };

      const action = userSliceActions.setUserData(updatedUser);
      const state = authSlice.reducer(initialState, action);

      expect(state.data).toBeDefined();
      if (state.data) {
        expect(state.data.name).toBe('Updated Name');
        expect(state.data.city).toBe('Tokyo');
        expect(state.data.description).toBe('Updated description');
      }
    });

    it('should replace user data completely in setUserData', () => {
      const newUser: User = {
        _id: 'new-123',
        name: 'Alice',
        image: 'https://example.com/alice.jpg',
        city: 'Paris',
        gender: 'female',
        birthdayDate: '1995-01-01',
        description: 'New user',
        likes: [],
        email: 'alice@test.com',
        createdAt: new Date().toISOString(),
        canTeach: {
          name: 'French',
          category: 'Иностранные языки',
          subcategory: 'Французский',
          subcategoryId: 'lang_french_001',
          description: 'Teach French',
          image: ['https://example.com/french.jpg'],
          customSkillId: 'skill_french_002',
        },
        wantsToLearn: [
          {
            name: 'Cooking',
            category: 'Дом и уют',
            subcategory: 'Приготовление еды',
            subcategoryId: 'home_cooking_001',
            customSkillId: 'want_cooking_001',
          },
        ],
      };

      const action = userSliceActions.setUserData(newUser);
      const state = authSlice.reducer(initialState, action);

      expect(state.data).toEqual(newUser);
    });

    it('should handle clearUserData', () => {
      const stateWithUser = {
        ...initialState,
        mockUser,
        authStatus: RequestStatus.Success,
        userCheck: true,
      };

      const action = userSliceActions.clearUserData();
      const state = authSlice.reducer(stateWithUser, action);

      expect(state.data).toBeNull();
      expect(state.authStatus).toBe(RequestStatus.Idle);
      expect(state.userCheck).toBe(false);
    });
  });
});
