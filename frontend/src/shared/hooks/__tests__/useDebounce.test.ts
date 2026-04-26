import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('возвращает начальное значение сразу', () => {
    const { result } = renderHook(() => useDebounce('test', 500));

    expect(result.current).toBe('test');
  });

  test('обновляет значение после задержки', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'first', delay: 300 },
    });

    rerender({ value: 'second', delay: 300 });

    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('second');
  });

  test('работает с числовыми значениями', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 1, delay: 200 },
    });

    rerender({ value: 2, delay: 200 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe(2);
  });

  test('меняет значение только после завершения задержки', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'a', delay: 100 },
    });

    rerender({ value: 'b', delay: 100 });

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(result.current).toBe('b');
  });
});
