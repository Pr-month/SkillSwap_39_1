import {
  createExchangeRequestApi,
  extractApiErrorMessage,
  getIncomingRequestsApi,
  getOutgoingRequestsApi,
  markAllRequestsAsReadApi,
  markRequestAsReadApi,
} from '@/api/skillSwapApi';
import { ExchangeRequest } from '@/entities/user/model/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

type ExchangeState = {
  requests: ExchangeRequest[];
  loading: boolean;
  error: string | null;
};

type CreateExchangeRequestPayload = {
  offeredSkillId: string;
  requestedSkillId: string;
};

const sortRequestsByDate = (requests: ExchangeRequest[]) =>
  [...requests].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

const mergeRequests = (
  incomingRequests: ExchangeRequest[],
  outgoingRequests: ExchangeRequest[],
) => {
  const uniqueRequests = new Map<string, ExchangeRequest>();

  [...incomingRequests, ...outgoingRequests].forEach((request) => {
    uniqueRequests.set(request.id, request);
  });

  return sortRequestsByDate([...uniqueRequests.values()]);
};

const initialState: ExchangeState = {
  requests: [],
  loading: false,
  error: null,
};

export const fetchExchanges = createAsyncThunk<
  ExchangeRequest[],
  void,
  { rejectValue: string }
>('exchange/fetch', async (_, { rejectWithValue }) => {
  try {
    const [incomingRequests, outgoingRequests] = await Promise.all([
      getIncomingRequestsApi(),
      getOutgoingRequestsApi(),
    ]);

    return mergeRequests(incomingRequests, outgoingRequests);
  } catch (error) {
    const message = extractApiErrorMessage(
      error,
      'Не удалось загрузить данные обменов',
    );

    if (message === 'Токен доступа отсутствует') {
      return [];
    }

    return rejectWithValue(message);
  }
});

export const createExchangeRequest = createAsyncThunk<
  void,
  CreateExchangeRequestPayload,
  { rejectValue: string }
>('exchange/create', async (payload, { dispatch, rejectWithValue }) => {
  try {
    await createExchangeRequestApi(payload);
    await dispatch(fetchExchanges()).unwrap();
  } catch (error) {
    return rejectWithValue(
      extractApiErrorMessage(error, 'Не удалось отправить заявку на обмен'),
    );
  }
});

export const markRequestAsRead = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('exchange/markRequestAsRead', async (requestId, { rejectWithValue }) => {
  try {
    await markRequestAsReadApi(requestId);
    return requestId;
  } catch (error) {
    return rejectWithValue(
      extractApiErrorMessage(error, 'Не удалось отметить заявку как прочитанную'),
    );
  }
});

export const markAllAsRead = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('exchange/markAllAsRead', async (_, { rejectWithValue }) => {
  try {
    await markAllRequestsAsReadApi();
  } catch (error) {
    return rejectWithValue(
      extractApiErrorMessage(
        error,
        'Не удалось отметить все заявки как прочитанные',
      ),
    );
  }
});

const exchangeSlice = createSlice({
  name: 'exchange',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchanges.pending, (state) => {
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
      })
      .addCase(createExchangeRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExchangeRequest.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createExchangeRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markRequestAsRead.fulfilled, (state, action) => {
        const request = state.requests.find(({ id }) => id === action.payload);

        if (request) {
          request.isRead = true;
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.requests.forEach((request) => {
          request.isRead = true;
        });
      });
  },
});

export const exchangeReducer = exchangeSlice.reducer;
