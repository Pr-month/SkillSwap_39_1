import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useSelector, type RootState } from '@/services/store/store';
import { toggleLike } from '@/services/slices/likeSlice';
import { selectIsLiked, selectLikesLoading } from '@/services/selectors/likeSelectors';
import { useLike } from '../useLike';

// Мокаем модули
const mockDispatch = vi.fn();
vi.mock('@/services/store/store', () => ({
  useDispatch: () => mockDispatch,
  useSelector: vi.fn(),
}));
vi.mock('@/services/selectors/likeSelectors', () => ({
  selectIsLiked: vi.fn(),
  selectLikesLoading: vi.fn(),
}));
vi.mock('@/services/slices/likeSlice', () => ({
  toggleLike: vi.fn(),
  reducer: () => ({
    likedItems: {},
    loading: false,
    error: null,
  }),
}));

// Создаем частичное состояние только с необходимыми для теста данными
const mockRootState = {
  likes: {
    likedItems: {},
    loading: false,
    error: null,
  },
} as unknown as RootState;

describe('useLike hook', () => {
  const itemId = 'test-item-id';
  const mockedUseSelector = vi.mocked(useSelector);
  const mockedToggleLike = vi.mocked(toggleLike);
  const mockedSelectIsLiked = vi.mocked(selectIsLiked);
  const mockedSelectLikesLoading = vi.mocked(selectLikesLoading);

  beforeEach(() => {
    vi.clearAllMocks();
    mockDispatch.mockClear();
    mockedUseSelector.mockClear();
    mockedToggleLike.mockClear();
    mockedSelectIsLiked.mockReturnValue(false);
    mockedSelectLikesLoading.mockReturnValue(false);
  });

  test('должен возвращать правильную структуру', () => {
    const result = useLike({ itemId });

    expect(result).toHaveProperty('isLiked');
    expect(result).toHaveProperty('isLoading');
    expect(result).toHaveProperty('toggleLike');
    expect(typeof result.toggleLike).toBe('function');
  });

  test('должен возвращать корректное значение isLiked', () => {
    mockedSelectIsLiked.mockReturnValue(true);
    mockedUseSelector.mockImplementation((selector: (state: RootState) => unknown) => {
      if (typeof selector === 'function') {
        return selector(mockRootState);
      }
      return false;
    });

    const { isLiked } = useLike({ itemId });
    expect(isLiked).toBe(true);
  });

  test('должен возвращать корректное значение isLoading', () => {
    mockedSelectLikesLoading.mockReturnValue(true);
    mockedUseSelector.mockImplementation((selector: (state: RootState) => unknown) => {
      if (typeof selector === 'function') {
        return selector(mockRootState);
      }
      return true;
    });

    const { isLoading } = useLike({ itemId });
    expect(isLoading).toBe(true);
  });

  test('toggleLike должен вызывать dispatch с правильным действием', () => {
    const { toggleLike: toggleLikeHandler } = useLike({ itemId });
    const thunkAction = vi.fn();
    mockedToggleLike.mockReturnValue(thunkAction);

    toggleLikeHandler();

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(thunkAction);
  });

  test('должен обрабатывать разные itemId', () => {
    const firstId = 'item-1';
    const secondId = 'item-2';
    const mockThunk1 = vi.fn();
    const mockThunk2 = vi.fn();

    mockedUseSelector.mockImplementation((selector: (state: RootState) => unknown) => {
      if (typeof selector === 'function') {
        return selector(mockRootState);
      }
      return false;
    });

    mockedToggleLike.mockReturnValueOnce(mockThunk1).mockReturnValueOnce(mockThunk2);

    const hook1 = useLike({ itemId: firstId });
    const hook2 = useLike({ itemId: secondId });

    hook1.toggleLike();
    expect(mockDispatch).toHaveBeenLastCalledWith(mockThunk1);

    hook2.toggleLike();
    expect(mockDispatch).toHaveBeenLastCalledWith(mockThunk2);
  });

  test('должен сохранять консистентность при множественных вызовах toggleLike', () => {
    const thunkAction = vi.fn();
    mockedToggleLike.mockReturnValue(thunkAction);

    const { toggleLike: toggleLikeHandler } = useLike({ itemId });

    // Множественные вызовы
    toggleLikeHandler();
    toggleLikeHandler();
    toggleLikeHandler();

    expect(mockDispatch).toHaveBeenCalledTimes(3);
    expect(mockDispatch).toHaveBeenCalledWith(thunkAction);
    expect(mockedToggleLike).toHaveBeenCalledTimes(3);
    expect(mockedToggleLike).toHaveBeenCalledWith(itemId);
  });
});
