import { createAsyncThunk } from '@reduxjs/toolkit';
import { AUTH_USER_SLICE } from '../slices/slicesName';
import { TAuthResponse, TLoginData, TUserResponse } from '@/shared/utils/api';
import { getUserApi, loginUserApi, logoutApi } from '@/shared/mocks/authMock';
import { deleteCookie, setCookie } from '@/shared/utils/cookies';

export const fetchUser = createAsyncThunk<TUserResponse, void>(
  `${AUTH_USER_SLICE}/fetchUser`,
  async (_, { rejectWithValue }) => {
    try {
      const data = await getUserApi();
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const loginUser = createAsyncThunk<TAuthResponse, TLoginData>(
  `${AUTH_USER_SLICE}/loginUser`,
  async (dataUser, { rejectWithValue }) => {
    try {
      const data = await loginUserApi(dataUser);
      setCookie('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const logoutUserApi = createAsyncThunk(
  `${AUTH_USER_SLICE}/logoutUserApi`,
  async (_, { rejectWithValue }) => {
    try {
      const data = await logoutApi();
      deleteCookie('accessToken');
      localStorage.removeItem('accessToken');
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);
