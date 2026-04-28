import { useCallback } from 'react';

interface ShareData {
  title: string;
  text: string;
  url?: string;
}

interface UseShareReturn {
  share: (data: ShareData) => Promise<boolean>;
  isSupported: boolean;
}

export const useShare = (): UseShareReturn => {
  const isSupported = useCallback(() => !!navigator.share, []);

  const fallbackShare = useCallback(async (data: ShareData): Promise<boolean> => {
    try {
      if (data.url && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(data.url);
      }
      alert(`Ссылка скопирована в буфер обмена:\n${data.url || data.title}`);
      return true;
    } catch (error) {
      console.error('Fallback share failed:', error);
      return false;
    }
  }, []);

  const share = useCallback(async (data: ShareData): Promise<boolean> => {
    try {
      if (navigator.share) {
        // ✅ Фикс: полный объект data
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
        });
        return true;
      }
      return await fallbackShare(data);  // ✅ await
    } catch (error) {
      console.error('Share failed:', error);
      return false;
    }
  }, [fallbackShare]);

  return {
    share,
    isSupported: isSupported(),
  };
};
