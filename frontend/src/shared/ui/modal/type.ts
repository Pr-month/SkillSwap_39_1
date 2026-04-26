type ModalType = 'info' | 'confirmation'; // Тип модального окна

export type TModalUIProps = {
  type?: ModalType; // Тип модального окна
  title: string; // Обязательный заголовок
  description?: string; // Описание (опционально)
  image?: string; // URL изображения (только для confirmation)
  onClose: () => void; // Обработчик закрытия
  children?: React.ReactNode; // Дочерний контент (только для info)
  className?: string; // Дополнительные классы для стилизации
  // Гибкие кнопки
  primaryButtonText?: string;
  primaryButtonAction?: () => void;
  secondaryButtonText?: string;
  secondaryButtonAction?: () => void;
};
