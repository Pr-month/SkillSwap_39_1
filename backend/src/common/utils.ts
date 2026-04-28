/**
 * Модуль для различных утилит
 */

/**
 * Убрать в строке начальные и конечные пробелы и двойные пробелы
 * @param value - исходная строка
 * @return - преобразованная строка
 */
export function normalizeString(value: string) {
  return value.trim().replace(/\s{2,}/g, ' ');
}
