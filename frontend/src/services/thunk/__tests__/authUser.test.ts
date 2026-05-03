import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchUser, loginUser, logoutUserApi } from '../authUser';
import { AUTH_USER_SLICE } from '../../slices/slicesName';
import {
  extractApiErrorMessage,
  getCurrentUserApi,
  loginUserApi as loginUserRequest,
  logoutUserApi as logoutUserRequest,
} from '@/api/skillSwapApi';
import { deleteCookie, setCookie } from '@/shared/utils/cookies';
import { usersData } from '@/shared/mocks/usersData';

vi.mock('@/api/skillSwapApi', () => ({
  getCurrentUserApi: vi.fn(),
  loginUserApi: vi.fn(),
  logoutUserApi: vi.fn(),
  extractApiErrorMessage: vi.fn((error: unknown, fallbackMessage: string) =>
    typeof error === 'string' ? error : fallbackMessage,
  ),
}));

vi.mock('@/shared/utils/cookies', () => ({
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
}));

const mockUser = usersData[0];

describe('authUser thunks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('fetchUser', () => {
    it('успешно получает текущего пользователя', async () => {
      vi.mocked(getCurrentUserApi).mockResolvedValue(mockUser);

      const dispatch = vi.fn();
      const thunk = fetchUser();
      const result = await thunk(dispatch, () => ({}), undefined);

      expect(getCurrentUserApi).toHaveBeenCalledTimes(1);
      expect(result.type).toBe(`${AUTH_USER_SLICE}/fetchUser/fulfilled`);
      expect(result.payload).toEqual({ user: mockUser });
    });

    it('очищает токены и возвращает текст ошибки при неудаче', async () => {
      vi.mocked(getCurrentUserApi).mockRejectedValue('Ошибка');

      const dispatch = vi.fn();
      const thunk = fetchUser();
      const result = await thunk(dispatch, () => ({}), undefined);

      expect(deleteCookie).toHaveBeenCalledWith('accessToken');
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(extractApiErrorMessage).toHaveBeenCalledWith(
        'Ошибка',
        'Не удалось получить данные пользователя',
      );
      expect(result.type).toBe(`${AUTH_USER_SLICE}/fetchUser/rejected`);
      expect(result.payload).toBe('Ошибка');
    });
  });

  describe('loginUser', () => {
    it('сохраняет токены и возвращает пользователя после логина', async () => {
      vi.mocked(loginUserRequest).mockResolvedValue({
        accessToken: 'token',
        refreshToken: 'refresh',
      });
      vi.mocked(getCurrentUserApi).mockResolvedValue(mockUser);

      const dispatch = vi.fn();
      const thunk = loginUser({ email: 'test@example.com', password: 'Password123!' });
      const result = await thunk(dispatch, () => ({}), undefined);

      expect(loginUserRequest).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      });
      expect(setCookie).toHaveBeenCalledWith('accessToken', 'token');
      expect(localStorage.getItem('refreshToken')).toBe('refresh');
      expect(getCurrentUserApi).toHaveBeenCalledTimes(1);
      expect(result.type).toBe(`${AUTH_USER_SLICE}/loginUser/fulfilled`);
      expect(result.payload).toEqual({
        accessToken: 'token',
        refreshToken: 'refresh',
        user: mockUser,
      });
    });

    it('очищает токены и возвращает понятную ошибку при неудачном логине', async () => {
      vi.mocked(loginUserRequest).mockRejectedValue({
        message: 'Неверный email или пароль',
      });

      const dispatch = vi.fn();
      const thunk = loginUser({ email: 'test@example.com', password: 'wrong' });
      const result = await thunk(dispatch, () => ({}), undefined);

      expect(deleteCookie).toHaveBeenCalledWith('accessToken');
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(extractApiErrorMessage).toHaveBeenCalledWith(
        { message: 'Неверный email или пароль' },
        'Не удалось выполнить вход',
      );
      expect(result.type).toBe(`${AUTH_USER_SLICE}/loginUser/rejected`);
      expect(result.payload).toBe('Не удалось выполнить вход');
    });
  });

  describe('logoutUserApi', () => {
    it('выполняет выход и очищает сохранённые токены', async () => {
      localStorage.setItem('refreshToken', 'refresh');
      vi.mocked(logoutUserRequest).mockResolvedValue({
        message: 'Выход выполнен успешно',
      });

      const dispatch = vi.fn();
      const thunk = logoutUserApi();
      const result = await thunk(dispatch, () => ({}), undefined);

      expect(logoutUserRequest).toHaveBeenCalledTimes(1);
      expect(deleteCookie).toHaveBeenCalledWith('accessToken');
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(result.type).toBe(`${AUTH_USER_SLICE}/logoutUserApi/fulfilled`);
      expect(result.payload).toEqual({ message: 'Выход выполнен успешно' });
    });

    it('очищает токены даже если logout-запрос завершился ошибкой', async () => {
      localStorage.setItem('refreshToken', 'refresh');
      vi.mocked(logoutUserRequest).mockRejectedValue({
        message: 'Ошибка выхода',
      });

      const dispatch = vi.fn();
      const thunk = logoutUserApi();
      const result = await thunk(dispatch, () => ({}), undefined);

      expect(deleteCookie).toHaveBeenCalledWith('accessToken');
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(extractApiErrorMessage).toHaveBeenCalledWith(
        { message: 'Ошибка выхода' },
        'Не удалось выполнить выход',
      );
      expect(result.type).toBe(`${AUTH_USER_SLICE}/logoutUserApi/rejected`);
      expect(result.payload).toBe('Не удалось выполнить выход');
    });
  });
});
