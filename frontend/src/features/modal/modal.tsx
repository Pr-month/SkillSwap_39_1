import { FC, memo, useEffect } from 'react';
import ReactDOM from 'react-dom';

import { TModalProps } from './type';
import { ModalUI } from '@/shared/ui/modal/modalUi';

const modalRoot = document.getElementById('modals');

export const Modal: FC<TModalProps> = memo(props => {
  const { onClose } = props;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!modalRoot) return null;

  return ReactDOM.createPortal(<ModalUI {...props} />, modalRoot);
});
