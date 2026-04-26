import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useShare } from '../useShare';

const shareData = {
  title: 'Test Title',
  text: 'Test Text',
  url: 'https://example.com',
};

describe('useShare', () => {
  interface NavigatorMock extends Omit<typeof navigator, 'share' | 'clipboard'> {
    share?: (data: { title: string; text: string; url?: string }) => Promise<void>;
    clipboard?: { writeText: (text: string) => Promise<void> };
  }

  let originalNavigator: NavigatorMock;
  let mockClipboard: { writeText: ReturnType<typeof vi.fn> };
  let mockAlert: ReturnType<typeof vi.fn>;

  // Хранилище для значений, возвращаемых хуком
  type ShareDataType = {
    title: string;
    text: string;
    url?: string;
  };
  let result: {
    isSupported: boolean;
    share: (data: ShareDataType) => Promise<boolean>;
  } | null;

  const TestComponent = () => {
    result = useShare();
    return null;
  };

  beforeEach(() => {
    // Сохраняем оригинальный navigator
    originalNavigator = global.navigator as unknown as NavigatorMock;

    // Инициализируем моки
    mockClipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    mockAlert = vi.fn();

    global.alert = mockAlert;
    result = null;
  });

  afterEach(() => {
    // Восстанавливаем оригинальный navigator
    global.navigator = originalNavigator as unknown as Navigator;
    vi.restoreAllMocks();
  });

  const renderHook = () => {
    render(<TestComponent />);
    // Убедимся, что хук отработал
    if (!result) {
      throw new Error('useShare did not return value');
    }
    return result;
  };

  test('isSupported возвращает true, если navigator.share доступен', () => {
    global.navigator = {
      ...originalNavigator,
      share: vi.fn(),
    } as unknown as Navigator;

    const { isSupported } = renderHook();

    expect(isSupported).toBe(true);
  });

  test('isSupported возвращает false, если navigator.share недоступен', () => {
    global.navigator = {
      ...originalNavigator,
    } as unknown as Navigator;

    const { isSupported } = renderHook();

    expect(isSupported).toBe(false);
  });

  test('share вызывает navigator.share и возвращает true при успехе', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    global.navigator = {
      ...originalNavigator,
      share: mockShare,
    } as unknown as Navigator;

    const { share } = renderHook();

    const success = await act(() => share(shareData));

    expect(mockShare).toHaveBeenCalledWith(shareData);
    expect(success).toBe(true);
  });

  test('share вызывает fallbackShare, если navigator.share недоступен (с url)', async () => {
    global.navigator = {
      ...originalNavigator,
      clipboard: mockClipboard,
    } as unknown as Navigator;

    const { share } = renderHook();

    const success = await act(() => share(shareData));

    expect(mockClipboard.writeText).toHaveBeenCalledWith(shareData.url);
    expect(global.alert).toHaveBeenCalledWith(expect.stringContaining(shareData.url));
    expect(success).toBe(true);
  });

  test('share вызывает fallbackShare, если navigator.share недоступен (без url)', async () => {
    global.navigator = {
      ...originalNavigator,
      clipboard: mockClipboard,
    } as unknown as Navigator;

    const { share } = renderHook();
    const dataNoUrl: ShareDataType = { title: 'Only Title', text: 'Only Text' };
    const success = await act(() => share(dataNoUrl));
    expect(mockClipboard.writeText).not.toHaveBeenCalled();
    expect(global.alert).toHaveBeenCalledWith(expect.stringContaining(dataNoUrl.title));
    expect(success).toBe(true);
  });

  test('share возвращает false при ошибке fallbackShare', async () => {
    const errorClipboard = { 
      writeText: vi.fn().mockRejectedValue(new Error('fail'))  // ✅ Promise.reject
    };

    global.navigator = {
      ...originalNavigator,
      clipboard: errorClipboard,
    } as unknown as Navigator;

    const { share } = renderHook();

    const success = await act(async () => share(shareData));

    expect(errorClipboard.writeText).toHaveBeenCalledWith(shareData.url);  // ✅
    expect(success).toBe(false);  // ✅ Правильно!
    expect(mockAlert).not.toHaveBeenCalled();  // ✅ Нет ложного alert!
  });


  test('share возвращает false при ошибке navigator.share', async () => {
    const errorShare = vi.fn().mockRejectedValue(new Error('fail'));
    global.navigator = {
      ...originalNavigator,
      share: errorShare,
    } as unknown as Navigator;

    const { share } = renderHook();
    const success = await act(async () => share(shareData));

    expect(errorShare).toHaveBeenCalledWith(shareData);
    expect(success).toBe(false);  // ✅ Правильно!
  });
});
