import { describe, expect, beforeEach, vi } from 'vitest';
import { configureStore, ThunkDispatch, Action } from '@reduxjs/toolkit';
import likeReducer, { setLike, clearLikes, initializeLikes, toggleLike } from '../likeSlice';

// Определение типа состояния
interface RootState {
  likes: {
    likedItems: Record<string, boolean>;
    loading: boolean;
    error: string | null;
  };
}

type AppDispatch = ThunkDispatch<RootState, undefined, Action>;

describe('likeSlice', () => {
  let store: ReturnType<typeof configureStore<RootState, Action>>;
  let dispatch: AppDispatch;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    // Подавляем вывод ошибок в консоль
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    // Восстанавливаем console.error
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();

    store = configureStore({
      reducer: {
        likes: likeReducer,
      },
    });

    dispatch = store.dispatch as AppDispatch;
  });

  // Тесты для синхронных действий
  describe('синхронные действия', () => {
    test('должно устанавливать лайк для элемента', () => {
      const initialState = {
        likedItems: {},
        loading: false,
        error: null,
      };

      const action = setLike({ itemId: '1', liked: true });
      const state = likeReducer(initialState, action);

      expect(state.likedItems['1']).toBe(true);
    });

    test('должно очищать все лайки', () => {
      const initialState = {
        likedItems: { '1': true, '2': true },
        loading: false,
        error: null,
      };

      const state = likeReducer(initialState, clearLikes());

      expect(state.likedItems).toEqual({});
      expect(state.error).toBeNull();
    });
  });

  // Тесты для асинхронных действий
  describe('асинхронные действия', () => {
    test('должно инициализировать лайки из localStorage', async () => {
      // Подготавливаем данные в localStorage
      localStorage.setItem('likedSkills', JSON.stringify(['1', '2']));
      localStorage.setItem('likedUsers', JSON.stringify(['3']));

      await dispatch(initializeLikes());
      const state = store.getState().likes;

      expect(state.likedItems).toEqual({
        '1': true,
        '2': true,
        '3': true,
      });
    });

    test('должно обрабатывать пустой localStorage при инициализации', async () => {
      await dispatch(initializeLikes());
      const state = store.getState().likes;

      expect(state.likedItems).toEqual({});
    });

    test('должно переключать статус лайка', async () => {
      // Устанавливаем начальное состояние
      localStorage.setItem('likedSkills', JSON.stringify(['1']));
      await dispatch(initializeLikes());

      // Проверяем отмену лайка
      await dispatch(toggleLike('1'));
      let state = store.getState().likes;
      expect(state.likedItems['1']).toBe(false);

      // Проверяем установку лайка
      await dispatch(toggleLike('1'));
      state = store.getState().likes;
      expect(state.likedItems['1']).toBe(true);
    });

    test('должно обрабатывать ошибки localStorage при инициализации', async () => {
      // Мокаем localStorage.getItem, чтобы он выбрасывал ошибку
      const mockGetItem = vi.spyOn(Storage.prototype, 'getItem');
      mockGetItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = await dispatch(initializeLikes());
      expect(result.type).toBe(initializeLikes.rejected.type);

      const state = store.getState().likes;
      expect(state.error).toBe('Ошибка при инициализации лайков');
      expect(state.loading).toBe(false);

      // Восстанавливаем оригинальную реализацию
      mockGetItem.mockRestore();
    });
  });

  // Тесты для проверки состояния загрузки
  describe('состояния загрузки', () => {
    test('должно устанавливать состояние загрузки при переключении лайка', async () => {
      dispatch(toggleLike('1'));
      let state = store.getState().likes;
      expect(state.loading).toBe(true);

      await dispatch(toggleLike('1'));
      state = store.getState().likes;
      expect(state.loading).toBe(false);
    });

    test('должно устанавливать состояние загрузки при инициализации', async () => {
      const promise = dispatch(initializeLikes());
      let state = store.getState().likes;
      expect(state.loading).toBe(true);

      await promise;
      state = store.getState().likes;
      expect(state.loading).toBe(false);
    });
  });

  // Тесты для обработки ошибок в toggleLike
  describe('обработка ошибок', () => {
    test('должно обрабатывать ошибки localStorage в toggleLike', async () => {
      const mockGetItem = vi.spyOn(Storage.prototype, 'getItem');
      mockGetItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = await dispatch(toggleLike('1'));
      expect(result.type).toBe(toggleLike.rejected.type);

      const state = store.getState().likes;
      expect(state.error).toBe('Ошибка при обработке лайка');
      expect(state.loading).toBe(false);

      mockGetItem.mockRestore();
    });

    test('должно корректно обрабатывать отсутствие данных в localStorage в toggleLike', async () => {
      localStorage.clear();

      const result = await dispatch(toggleLike('1'));
      expect(result.type).toBe(toggleLike.fulfilled.type);

      const state = store.getState().likes;
      expect(state.error).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.likedItems['1']).toBe(true);
    });
  });
});
