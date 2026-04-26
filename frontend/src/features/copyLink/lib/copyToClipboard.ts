/**
 * Утилита для копирования текста в буфер обмена
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Не удалось скопировать в буфер обмена', err);
    return false;
  }
};
