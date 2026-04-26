import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyToClipboard } from './copyToClipboard';

describe('copyToClipboard', () => {
  const originalClipboard = { ...global.navigator.clipboard };
  const originalError = console.error;

  beforeEach(() => {
    // @ts-expect-error: тестовый мок
    global.navigator.clipboard = {
      writeText: vi.fn(),
    };
    console.error = vi.fn();
  });

  afterEach(() => {
    // @ts-expect-error: тестовый мок
    global.navigator.clipboard = originalClipboard;
    console.error = originalError;
    vi.restoreAllMocks();
  });

  it('возвращает true при успешном копировании', async () => {
    const text = 'test string';
    const writeText = vi.spyOn(global.navigator.clipboard, 'writeText').mockResolvedValueOnce();

    const result = await copyToClipboard(text);

    expect(writeText).toHaveBeenCalledWith(text);
    expect(result).toBe(true);
  });

  it('возвращает false и логирует ошибку при неудаче', async () => {
    const text = 'fail string';
    const error = new Error('fail');
    const writeText = vi
      .spyOn(global.navigator.clipboard, 'writeText')
      .mockRejectedValueOnce(error);
    const errorSpy = vi.spyOn(console, 'error');

    const result = await copyToClipboard(text);

    expect(writeText).toHaveBeenCalledWith(text);
    expect(result).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith('Не удалось скопировать в буфер обмена', error);
  });

  it('работает с пустой строкой', async () => {
    const writeText = vi.spyOn(global.navigator.clipboard, 'writeText').mockResolvedValueOnce();

    const result = await copyToClipboard('');

    expect(writeText).toHaveBeenCalledWith('');
    expect(result).toBe(true);
  });

  it('работает с длинной строкой', async () => {
    const longText = 'a'.repeat(1000);
    const writeText = vi.spyOn(global.navigator.clipboard, 'writeText').mockResolvedValueOnce();

    const result = await copyToClipboard(longText);

    expect(writeText).toHaveBeenCalledWith(longText);
    expect(result).toBe(true);
  });
});
