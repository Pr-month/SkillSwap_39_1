import { createAsyncThunk } from '@reduxjs/toolkit';
import { AUTH_USER_SLICE } from '../slices/slicesName';
import { TAuthResponse, TLoginData, TUserResponse } from '@/shared/utils/api';
import { deleteCookie, setCookie } from '@/shared/utils/cookies';
import {
  extractApiErrorMessage,
  getCurrentUserApi,
  loginUserApi,
  logoutUserApi as logoutUserRequest,
} from '@/api/skillSwapApi';

const persistTokens = (accessToken: string, refreshToken: string) => {
  setCookie('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const clearAuthStorage = () => {
  deleteCookie('accessToken');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const fetchUser = createAsyncThunk<TUserResponse, void>(
  `${AUTH_USER_SLICE}/fetchUser`,
  async (_, { rejectWithValue }) => {
    try {
      const user = await getCurrentUserApi();
      return { user };
    } catch (error) {
      clearAuthStorage();
      return rejectWithValue(
        extractApiErrorMessage(error, 'Не удалось получить данные пользователя'),
      );
    }
  },
);

export const loginUser = createAsyncThunk<TAuthResponse, TLoginData>(
  `${AUTH_USER_SLICE}/loginUser`,
  async (dataUser, { rejectWithValue }) => {
    try {
      const tokens = await loginUserApi(dataUser);
      persistTokens(tokens.accessToken, tokens.refreshToken);
      const user = await getCurrentUserApi();
      return {
        ...tokens,
        user,
      };
    } catch (error) {
      clearAuthStorage();
      return rejectWithValue(
        extractApiErrorMessage(error, 'Не удалось выполнить вход'),
      );
    }
  },
);

export const logoutUserApi = createAsyncThunk<{ message: string }, void>(
  `${AUTH_USER_SLICE}/logoutUserApi`,
  async (_, { rejectWithValue }) => {
    try {
      const data = await logoutUserRequest();
      clearAuthStorage();
      return data;
    } catch (error) {
      clearAuthStorage();
      return rejectWithValue(
        extractApiErrorMessage(error, 'Не удалось выполнить выход'),
      );
    }
  },
);
