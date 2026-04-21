import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersData } from '@/shared/mocks/usersData';
import { User } from '@/entities/user/model/types';

// Ключ для localStorage
const LS_KEY = 'catalog_profiles';

interface CatalogState {
  users: User[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: CatalogState = {
  users: [],
  loading: false,
  error: null,
  searchQuery: '',
};

const getCachedUsers = (): User[] | null => {
  try {
    const savedData = localStorage.getItem(LS_KEY);
    return savedData ? JSON.parse(savedData) : null;
  } catch (e) {
    console.error('Ошибка чтения кэша профилей:', e);
    return null;
  }
};

// Async Thunk - единственный источник правды для данных
export const fetchCatalog = createAsyncThunk('catalog/fetch', async (_, { rejectWithValue }) => {
  try {
    const cachedUsers = getCachedUsers();
    return cachedUsers || usersData;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return rejectWithValue('Ошибка загрузки профилей');
  }
});

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setSearchQuery(state, action) {
      state.searchQuery = action.payload.toLowerCase(); // Сохраняем в нижнем регистре
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCatalog.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCatalog.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
        localStorage.setItem(LS_KEY, JSON.stringify(action.payload));
      })
      .addCase(fetchCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchQuery } = catalogSlice.actions;
export const catalogReducer = catalogSlice.reducer;
