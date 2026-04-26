import { User } from '@/entities/user/model/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AUTH_USER_SLICE } from './slicesName';
import { RequestStatus } from '@/entities/auth/model/types';
import { fetchUser, loginUser, logoutUserApi } from '../thunk/authUser';

export interface AuthState {
  data: User | null;
  authStatus: RequestStatus;
  userCheck: boolean;
}

export const initialState: AuthState = {
  data: null,
  authStatus: RequestStatus.Idle,
  userCheck: false,
};

export const authSlice = createSlice({
  name: AUTH_USER_SLICE,
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<User>) => {
      state.data = action.payload;
    },
    clearUserData: state => {
      state.data = null;
      state.authStatus = RequestStatus.Idle;
      state.userCheck = false;
    },
  },
  extraReducers: builder => {
    const handlePending = (state: AuthState) => {
      state.authStatus = RequestStatus.Loading;
    };

    const handleFulfilled = (state: AuthState, action: { payload: { user: User } }) => {
      state.data = action.payload.user;
      state.authStatus = RequestStatus.Success;
      state.userCheck = true;
    };

    const handleRejected = (state: AuthState) => {
      state.authStatus = RequestStatus.Failed;
      state.userCheck = true;
    };

    const handlelogout = (state: AuthState) => {
      state.authStatus = RequestStatus.Success;
      state.data = null;
    };

    builder
      .addCase(fetchUser.pending, handlePending)
      .addCase(fetchUser.fulfilled, handleFulfilled)
      .addCase(fetchUser.rejected, handleRejected)
      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, handleFulfilled)
      .addCase(loginUser.rejected, handleRejected)
      .addCase(logoutUserApi.pending, handlePending)
      .addCase(logoutUserApi.fulfilled, handlelogout)
      .addCase(logoutUserApi.rejected, handleRejected);
  },
  selectors: {
    selectUser: state => state.data,
    selectUserCheck: state => state.userCheck,
    selectRequestStatus: state => state.authStatus,
  },
});

export const userSliceActions = authSlice.actions;
export const userSliceSelectors = authSlice.selectors;
export default authSlice;
