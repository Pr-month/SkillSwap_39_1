import { DropdownItem } from '@/shared/ui/dropdown/dropdown';
import { copyToClipboard } from '../lib/copyToClipboard';

interface CopyLinkDropdownItemProps {
  url: string;
  onSuccess?: () => void;
  onError?: () => void;
}

/**
 * Возвращает объект типа DropdownItem для пункта "Копировать ссылку"
 */
export const CopyLinkDropdownItem = ({
  url,
  onSuccess,
  onError,
}: CopyLinkDropdownItemProps): DropdownItem => ({
  id: 'copy-link',
  label: 'Копировать ссылку',
  icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  onClick: async () => {
    const success = await copyToClipboard(url);
    if (success) {
      onSuccess?.();
    } else {
      onError?.();
    }
  },
});
