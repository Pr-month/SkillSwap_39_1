import { useEffect, useState } from 'react';

/**
 * Кастомный хук для дебаунса значения.
 * @param value - Значение, которое нужно дебаунсить.
 * @param delay - Задержка в миллисекундах.
 * @returns Дебаунснутое значение.
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Устанавливаем таймер, который обновит debouncedValue после задержки
    const timerId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Очищаем таймер при каждом изменении `value` или размонтировании компонента
    return () => {
      clearTimeout(timerId);
    };
  }, [value, delay]); // Зависимости: перезапуск эффекта при изменении value или delay

  return debouncedValue;
};
