import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const LS_EXCHANGE_KEY = 'exchange_requests';

interface ExchangeRequest {
  id: string | number;
  fromUserId: string | number;
  fromUserName: string;
  toUserId: string | number;
  toUserName?: string;
  isRead: boolean;
  status?: 'pending' | 'accepted' | 'rejected';
  type?: 'incoming' | 'outgoing';
  createdAt: string;
}

interface ExchangeState {
  requests: ExchangeRequest[];
  loading: boolean;
  error: string | null;
}

// Моки для инициализации
const INITIAL_MOCKS: ExchangeRequest[] = [
  {
    id: 1,
    fromUserName: 'Алексей',
    fromUserId: 'user_001',
    toUserId: 'user_002',
    status: 'pending',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    fromUserName: 'Мария',
    fromUserId: 'user_055',
    toUserId: 'user_002',
    status: 'pending',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3,
    fromUserName: 'Иван',
    fromUserId: 'user_003',
    toUserId: 'user_002',
    status: 'accepted',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Инициализация хранилища
const initializeExchangeData = () => {
  /* Для очистки хранилища - раскомментировать обновить и закомментировать */
  // localStorage.removeItem(LS_EXCHANGE_KEY);
  if (!localStorage.getItem(LS_EXCHANGE_KEY)) {
    localStorage.setItem(LS_EXCHANGE_KEY, JSON.stringify(INITIAL_MOCKS));
  }
};
initializeExchangeData();

// Thunk для загрузки данных
export const fetchExchanges = createAsyncThunk('exchange/fetch', async (_, { rejectWithValue }) => {
  try {
    const savedData = localStorage.getItem(LS_EXCHANGE_KEY);
    return savedData ? JSON.parse(savedData) : INITIAL_MOCKS;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return rejectWithValue('Ошибка загрузки данных обменов');
  }
});

const initialState: ExchangeState = {
  requests: INITIAL_MOCKS,
  loading: false,
  error: null,
};

const exchangeSlice = createSlice({
  name: 'exchange',
  initialState,
  reducers: {
    addRequest: {
      reducer(state, action: PayloadAction<ExchangeRequest>) {
        state.requests.unshift(action.payload);
        localStorage.setItem(LS_EXCHANGE_KEY, JSON.stringify(state.requests));
      },
      prepare(payload: Omit<ExchangeRequest, 'id' | 'isRead' | 'createdAt'>) {
        return {
          payload: {
            ...payload,
            id: `req_${Date.now()}`,
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        };
      },
    },
    removeRequest: (state, action: PayloadAction<string | number>) => {
      state.requests = state.requests.filter(req => req.id !== action.payload);
      localStorage.setItem(LS_EXCHANGE_KEY, JSON.stringify(state.requests));
    },
    clearAllRequests: state => {
      state.requests = [];
      localStorage.setItem(LS_EXCHANGE_KEY, JSON.stringify(state.requests));
    },
    markAsRead: (state, action: PayloadAction<string | number>) => {
      const request = state.requests.find(req => req.id === action.payload);
      if (request) {
        request.isRead = true;
        localStorage.setItem(LS_EXCHANGE_KEY, JSON.stringify(state.requests));
      }
    },
    markAllAsRead: state => {
      state.requests.forEach(request => {
        request.isRead = true;
      });
      localStorage.setItem(LS_EXCHANGE_KEY, JSON.stringify(state.requests));
    },
    updateRequestStatus: (
      state,
      action: PayloadAction<{
        id: string | number;
        status: 'pending' | 'accepted' | 'rejected';
      }>,
    ) => {
      const request = state.requests.find(req => req.id === action.payload.id);
      if (request) {
        request.status = action.payload.status;
        localStorage.setItem(LS_EXCHANGE_KEY, JSON.stringify(state.requests));
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchExchanges.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExchanges.fulfilled, (state, action) => {
        state.requests = action.payload;
        state.loading = false;
      })
      .addCase(fetchExchanges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Экспорт всех экшенов
export const {
  addRequest,
  removeRequest,
  clearAllRequests,
  markAsRead,
  markAllAsRead,
  updateRequestStatus,
} = exchangeSlice.actions;

export const exchangeReducer = exchangeSlice.reducer;
