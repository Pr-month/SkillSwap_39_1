import { vi } from 'vitest';
import { fetchUser, loginUser, logoutUserApi } from '../authUser';
import { AUTH_USER_SLICE } from '../../slices/slicesName';

vi.mock('@/shared/mocks/authMock', () => ({
  getUserApi: vi.fn(),
  loginUserApi: vi.fn(),
  logoutApi: vi.fn(),
}));

vi.mock('@/shared/utils/cookies', () => ({
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
}));

describe('authUser thunks', () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('fetchUser', () => {
    test('успешный запрос', async () => {
      const { getUserApi } = await import('@/shared/mocks/authMock');
      const user = { id: '1', name: 'Test' };
      (getUserApi as jest.Mock).mockResolvedValue(user);

      const dispatch = vi.fn();
      const thunk = fetchUser();
      const result = await thunk(dispatch, () => ({}), undefined);

      expect(result.type).toBe(`${AUTH_USER_SLICE}/fetchUser/fulfilled`);
      expect(result.payload).toEqual(user);
    });

    test('ошибка запроса', async () => {
      const { getUserApi } = await import('@/shared/mocks/authMock');
      (getUserApi as jest.Mock).mockRejectedValue('error');

      const dispatch = vi.fn();
      const thunk = fetchUser();
      const result = await thunk(dispatch, () => ({}), undefined);

      expect(result.type).toBe(`${AUTH_USER_SLICE}/fetchUser/rejected`);
      expect(result.payload).toBe('error');
    });
  });

  describe('loginUser', () => {
    test('успешный логин', async () => {
      const { loginUserApi } = await import('@/shared/mocks/authMock');
      const { setCookie } = await import('@/shared/utils/cookies');
      const authData = { accessToken: 'token', refreshToken: 'refresh' };
      (loginUserApi as jest.Mock).mockResolvedValue(authData);

      const dispatch = vi.fn();
      const thunk = loginUser({ email: 'test', password: '123' });
      const result = await thunk(dispatch, () => ({}), undefined);

      expect(result.type).toBe(`${AUTH_USER_SLICE}/loginUser/fulfilled`);
      expect(result.payload).toEqual(authData);
      expect(setCookie as jest.Mock).toHaveBeenCalledWith('accessToken', 'token');
      expect(localStorage.getItem('refreshToken')).toBe('refresh');
    });

    test('ошибка логина', async () => {
      const { loginUserApi } = await import('@/shared/mocks/authMock');
      (loginUserApi as jest.Mock).mockRejectedValue('error');

      const dispatch = vi.fn();
      const thunk = loginUser({ email: 'test', password: '123' });
      const result = await thunk(dispatch, () => ({}), undefined);

      expect(result.type).toBe(`${AUTH_USER_SLICE}/loginUser/rejected`);
      expect(result.payload).toBe('error');
    });
  });

  describe('logoutUserApi', () => {
    test('успешный логаут', async () => {
      const { logoutApi } = await import('@/shared/mocks/authMock');
      const { deleteCookie } = await import('@/shared/utils/cookies');
      (logoutApi as jest.Mock).mockResolvedValue({ success: true });

      const dispatch = vi.fn();
      const thunk = logoutUserApi();
      const result = await thunk(dispatch, () => ({}), undefined);

      expect(result.type).toBe(`${AUTH_USER_SLICE}/logoutUserApi/fulfilled`);
      expect(result.payload).toEqual({ success: true });
      expect(deleteCookie as jest.Mock).toHaveBeenCalledWith('accessToken');
      // Проверяем, что localStorage.removeItem был вызван
      // Можно добавить spy, если нужно строгое покрытие
    });

    test('ошибка логаута', async () => {
      const { logoutApi } = await import('@/shared/mocks/authMock');
      (logoutApi as jest.Mock).mockRejectedValue('error');

      const dispatch = vi.fn();
      const thunk = logoutUserApi();
      const result = await thunk(dispatch, () => ({}), undefined);

      expect(result.type).toBe(`${AUTH_USER_SLICE}/logoutUserApi/rejected`);
      expect(result.payload).toBe('error');
    });
  });
});
