import { describe, it, expect, beforeEach, vi } from 'vitest';
import { catalogReducer, fetchCatalog, setSearchQuery } from '../catalogSlice';
import { usersData } from '@/shared/mocks/usersData';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  key: vi.fn(),
  length: 0,
};

global.localStorage = localStorageMock;

describe('catalogSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const state = catalogReducer(undefined, { type: 'unknown' });
    expect(state).toEqual({
      users: [],
      loading: false,
      error: null,
      searchQuery: '',
    });
  });

  describe('setSearchQuery', () => {
    it('should set search query in lowercase', () => {
      const state = catalogReducer(undefined, setSearchQuery('JavaScript'));
      expect(state.searchQuery).toBe('javascript');
    });

    it('should handle empty string', () => {
      const state = catalogReducer(undefined, setSearchQuery(''));
      expect(state.searchQuery).toBe('');
    });
  });

  describe('fetchCatalog', () => {
    describe('fetchCatalog.pending', () => {
      it('should set loading to true and clear error', () => {
        const action = { type: fetchCatalog.pending.type };
        const state = catalogReducer(undefined, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
      });
    });

    describe('fetchCatalog.fulfilled', () => {
      it('should load users from cache if available', () => {
        const cachedUsers = [usersData[0], usersData[1]];
        localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedUsers));

        const action = { type: fetchCatalog.fulfilled.type, payload: cachedUsers };
        const state = catalogReducer(undefined, action);

        expect(state.users).toEqual(cachedUsers);
        expect(state.loading).toBe(false);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'catalog_profiles',
          JSON.stringify(cachedUsers),
        );
      });

      it('should load users from usersData if no cache', () => {
        localStorageMock.getItem.mockReturnValue(null);

        const action = { type: fetchCatalog.fulfilled.type, payload: usersData };
        const state = catalogReducer(undefined, action);

        expect(state.users).toEqual(usersData);
        expect(state.loading).toBe(false);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'catalog_profiles',
          JSON.stringify(usersData),
        );
      });
    });

    describe('fetchCatalog.rejected', () => {
      it('should handle error and set error message', () => {
        const action = {
          type: fetchCatalog.rejected.type,
          payload: 'Ошибка загрузки профилей',
        };

        const state = catalogReducer(undefined, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe('Ошибка загрузки профилей');
        expect(state.users).toEqual([]);
      });
    });
  });
});
