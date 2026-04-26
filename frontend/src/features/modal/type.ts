type ModalType = 'info' | 'confirmation'; // Тип модального окна

export type TModalProps = {
  type?: ModalType;
  title: string; // Обязательный заголовок
  description?: string; // Описание (опционально)
  image?: string; // URL изображения (только для confirmation)
  onClose: () => void; // Обработчик закрытия
  children?: React.ReactNode; // Дочерний контент (только для info)
  className?: string;
  primaryButtonText?: string;
  primaryButtonAction?: () => void;
  secondaryButtonText?: string;
  secondaryButtonAction?: () => void;
};
