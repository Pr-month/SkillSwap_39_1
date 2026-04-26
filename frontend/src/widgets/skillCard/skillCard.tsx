import { useState, useCallback, useMemo } from 'react';
// import { useAuth } from '@/features/auth/context/AuthContext'; //временно заменён на жёсткое значение
import { Dropdown } from '@/shared/ui/dropdown/dropdown';
import { LikeButton } from '@/shared/ui/likeButton/likeButton';
import { MoreButton } from '@/shared/ui/moreButton/moreButton';
import { ShareButton } from '@/shared/ui/shareButton/shareButton';
import { CopyLinkDropdownItem } from '@/features/copyLink';
import arrowLeft from '@/app/assets/static/images/icons/arrow-chevron-left.svg';
import arrowRight from '@/app/assets/static/images/icons/arrow-chevron-right.svg';
import styles from './skillCard.module.css';
import { Button } from '@/shared/ui/button/button';
import { useExchange } from '@/shared/hooks/useExchange';

export interface TeachableSkill {
  customSkillId: string;
  name: string;
  category: string;
  description: string;
  image: string[];
}

export interface SkillCardProps {
  skill: TeachableSkill;
  hideActions?: boolean;
  hideSliderControls?: boolean;
  renderButton?: () => React.ReactNode;
  className?: string;
  onExchangeClick?: () => void;
  ownerId: string;
  ownerName?: string;
}

const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  hideActions = false,
  hideSliderControls = false,
  renderButton,
  className,
  onExchangeClick,
  ownerId,
}) => {
  const { sendExchangeRequest, hasSentRequest } = useExchange();
  const alreadyRequested = hasSentRequest(ownerId);

  // === Извлечение изображений ===
  const mainImage = useMemo(
    () => (skill.image && skill.image[0]) || '/placeholder.jpg',
    [skill.image],
  );
  const previewImages = useMemo(() => (skill.image ? skill.image.slice(1) : []), [skill.image]);

  // === Все изображения для слайдера ===
  const allImages = useMemo(() => [mainImage, ...previewImages], [mainImage, previewImages]);
  const totalImages = allImages.length;
  const canNavigate = totalImages > 1;

  // === Состояния ===
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // === Обработчики ===
  const goToPrevImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev === 0 ? totalImages - 1 : prev - 1));
  }, [totalImages]);

  const goToNextImage = useCallback(() => {
    setCurrentImageIndex(prev => (prev === totalImages - 1 ? 0 : prev + 1));
  }, [totalImages]);

  const setImageIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalImages) {
        setCurrentImageIndex(index);
      }
    },
    [totalImages],
  );

  const handleClick = async () => {
    if (alreadyRequested) return;
    await sendExchangeRequest(ownerId);
    onExchangeClick?.();
  };

  const dropdownItems = useMemo(
    () => [
      CopyLinkDropdownItem({
        url: window.location.href,
        onSuccess: () => alert('Ссылка скопирована в буфер обмена'),
        onError: () => alert('Не удалось скопировать ссылку'),
      }),
    ],
    [],
  );

  return (
    <>
      <article
        className={`${styles.skillCard} ${className || ''}`}
        aria-label={`Навык: ${skill.name}`}
      >
        {/* === Панель действий === */}
        {!hideActions && (
          <div className={styles.action}>
            <LikeButton
              itemId={skill.customSkillId}
              className={styles.actionButton}
              ariaLabel="Понравилось"
            />
            <ShareButton
              title={skill.name}
              text={`Посмотри этот навык: ${skill.name} — ${skill.description}`}
              url={window.location.href}
              className={styles.actionButton}
              aria-label="Поделиться"
            />
            <Dropdown
              trigger={<MoreButton className={styles.actionButton} ariaLabel="Еще" />}
              items={dropdownItems}
              position="bottom-right"
            />
          </div>
        )}

        {/* === Основной контент === */}
        <div className={styles.skillDetails}>
          <div className={styles.skillContent}>
            <div className={styles.contentBeforeButton}>
              <h1 className={styles.title}>{skill.name}</h1>
              <p className={styles.category}>{skill.category}</p>
              <p className={styles.description}>{skill.description}</p>
            </div>

            {renderButton ? (
              renderButton()
            ) : alreadyRequested ? (
              <Button onClick={() => {}} type="secondary">
                <span className={styles.contentClock}>
                  <div className={styles.clock}></div>
                  <span>Обмен предложен</span>
                </span>
              </Button>
            ) : (
              <Button onClick={handleClick} type="primary">
                Предложить обмен
              </Button>
            )}
          </div>

          {/* === Галерея изображений === */}
          <div className={styles.skillImage}>
            <div className={styles.imageSlider} role="group" aria-label="Галерея изображений">
              {canNavigate && !hideSliderControls && (
                <button
                  type="button"
                  className={styles.prevArrow}
                  aria-label="Предыдущее изображение"
                  onClick={goToPrevImage}
                >
                  <img src={arrowLeft} alt="" aria-hidden="true" className={styles.imageArrow} />
                </button>
              )}

              <img
                className={styles.image}
                src={allImages[currentImageIndex]}
                alt={`${skill.name} (${currentImageIndex + 1}/${totalImages})`}
              />

              {canNavigate && !hideSliderControls && (
                <button
                  type="button"
                  className={styles.nextArrow}
                  aria-label="Следующее изображение"
                  onClick={goToNextImage}
                >
                  <img src={arrowRight} alt="" aria-hidden="true" className={styles.imageArrow} />
                </button>
              )}
            </div>

            {/* === Превью === */}
            <div className={styles.preview}>
              {previewImages.slice(0, 2).map((img, index) => (
                <img
                  key={index}
                  className={styles.imagePreview}
                  src={img}
                  alt={`Превью ${index + 1}: ${skill.name}`}
                  onClick={() => setImageIndex(index + 1)}
                />
              ))}
              <div className={styles.imagePreviewOverlay}>
                <img
                  className={styles.imagePreview}
                  src={previewImages[2] || previewImages[0]}
                  alt={`Превью с оверлеем: ${skill.name}`}
                  onClick={() => {
                    const targetImage = previewImages[2] || previewImages[0];
                    const realIndex = allImages.findIndex(img => img === targetImage);
                    setImageIndex(realIndex);
                  }}
                />
                <span className={styles.overlayText} aria-label="Еще изображения">
                  +{Math.max(0, previewImages.length - 3)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default SkillCard;
