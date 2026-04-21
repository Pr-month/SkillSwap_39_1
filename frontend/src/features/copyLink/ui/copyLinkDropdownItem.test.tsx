import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CopyLinkDropdownItem } from './copyLinkDropdownItem';
import * as copyLib from '../lib/copyToClipboard';

describe('CopyLinkDropdownItem', () => {
  const url = 'https://test.url';
  let copyToClipboardMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    copyToClipboardMock = vi.fn();
    vi.spyOn(copyLib, 'copyToClipboard').mockImplementation(copyToClipboardMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('возвращает корректный объект DropdownItem', () => {
    const item = CopyLinkDropdownItem({ url });

    expect(item).toHaveProperty('id', 'copy-link');
    expect(item).toHaveProperty('label', 'Копировать ссылку');
    expect(item).toHaveProperty('icon');
    expect(typeof item.onClick).toBe('function');
  });

  it('вызывает copyToClipboard с правильным url при клике', async () => {
    copyToClipboardMock.mockResolvedValueOnce(true);
    const item = CopyLinkDropdownItem({ url });

    await item.onClick();

    expect(copyToClipboardMock).toHaveBeenCalledWith(url);
  });

  it('вызывает onSuccess при успешном копировании', async () => {
    copyToClipboardMock.mockResolvedValueOnce(true);
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const item = CopyLinkDropdownItem({ url, onSuccess, onError });

    await item.onClick();

    expect(onSuccess).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('вызывает onError при неудачном копировании', async () => {
    copyToClipboardMock.mockResolvedValueOnce(false);
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const item = CopyLinkDropdownItem({ url, onSuccess, onError });

    await item.onClick();

    expect(onError).toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('корректно работает без onSuccess и onError', async () => {
    copyToClipboardMock.mockResolvedValueOnce(true);
    const item = CopyLinkDropdownItem({ url });

    await expect(item.onClick()).resolves.not.toThrow();
  });
});
