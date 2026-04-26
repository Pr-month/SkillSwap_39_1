import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/services/store/store';

interface LikeState {
  likedItems: Record<string, boolean>;
  loading: boolean;
  error: string | null;
}

const initialState: LikeState = {
  likedItems: {},
  loading: false,
  error: null,
};

// Инициализация из localStorage при запуске
export const initializeLikes = createAsyncThunk(
  'likes/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const likedSkills = JSON.parse(localStorage.getItem('likedSkills') || '[]');
      const likedUsers = JSON.parse(localStorage.getItem('likedUsers') || '[]');

      // Комбинируем все лайки в один объект
      const allLikes: Record<string, boolean> = {};
      likedSkills.forEach((id: string) => (allLikes[id] = true));
      likedUsers.forEach((id: string) => (allLikes[id] = true));

      return allLikes;
    } catch (error) {
      console.error('Failed to initialize likes:', error);
      return rejectWithValue('Ошибка при инициализации лайков');
    }
  },
);

export const toggleLike = createAsyncThunk(
  'likes/toggleLike',
  async (itemId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const isCurrentlyLiked = state.likes.likedItems[itemId] || false;

      // Имитация API вызова
      await new Promise(resolve => setTimeout(resolve, 300));

      // Обновляем localStorage
      const liked = JSON.parse(localStorage.getItem('likedSkills') || '[]');
      let updated;
      if (isCurrentlyLiked) {
        updated = liked.filter((id: string) => id !== itemId);
      } else {
        updated = [...liked, itemId];
      }
      localStorage.setItem('likedSkills', JSON.stringify(updated));

      return { itemId, liked: !isCurrentlyLiked };
    } catch (error) {
      console.error('Like error:', error);
      return rejectWithValue('Ошибка при обработке лайка');
    }
  },
);

const likeSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    setLike: (state, action) => {
      const { itemId, liked } = action.payload;
      state.likedItems[itemId] = liked;
    },
    clearLikes: state => {
      state.likedItems = {};
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(initializeLikes.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeLikes.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.likedItems = action.payload;
      })
      .addCase(initializeLikes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleLike.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const { itemId, liked } = action.payload;
        state.likedItems[itemId] = liked;
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setLike, clearLikes } = likeSlice.actions;
export default likeSlice.reducer;
