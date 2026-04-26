import { FC, memo } from 'react';
import styles from './modalUi.module.css';
import { TModalUIProps } from './type';
import { ModalOverlayUI } from '../modal-overlay/modal-overlay';
import { Button } from '../button/button';

const ModalUIComponent: FC<TModalUIProps> = ({
  type = 'info',
  title,
  description,
  image,
  onClose,
  children,
  className,
  primaryButtonText = 'Готово',
  primaryButtonAction,
  secondaryButtonText,
  secondaryButtonAction,
}) => {
  // Определяем действие для основной кнопки
  const handlePrimary = primaryButtonAction || onClose;

  return (
    <>
      <ModalOverlayUI onClick={onClose} />

      {/* Модальное окно */}
      <div
        className={`${styles.modal} ${className || ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Показываем изображение только для типа confirmation */}
        {type === 'confirmation' && image && (
          <img
            src={image}
            alt="Status"
            className={styles.img}
            onError={e => (e.currentTarget.src = '/default-image.png')}
          />
        )}

        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            {title || 'Модальное окно'}
          </h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>

        {/* Дочерний контент только для типа info */}
        {type === 'info' && children && <div className={styles.content}>{children}</div>}

        {/* Кнопки только для типа confirmation */}
        {type === 'confirmation' && (
          <div className={styles.buttonContainer}>
            {secondaryButtonText && secondaryButtonAction && (
              <Button type="secondary" onClick={secondaryButtonAction}>
                {secondaryButtonText}
              </Button>
            )}
            <Button type="primary" onClick={handlePrimary}>
              {primaryButtonText}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export const ModalUI = memo(ModalUIComponent);

ModalUI.displayName = 'ModalUI';
