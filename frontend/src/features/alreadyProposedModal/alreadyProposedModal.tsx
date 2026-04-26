import { Modal } from '@/features/modal/modal';
import pendingIcon from '@/app/assets/static/images/icons/notification.svg';

export const AlreadyProposedModal = ({ onClose }: { onClose: () => void }) => {
  const handleDone = () => {
    onClose();
  };

  return (
    <Modal
      title="Вы предложили обмен"
      description="Теперь дождитесь подтверждения. Вам придёт уведомление"
      image={pendingIcon}
      type="confirmation"
      onClose={onClose}
      primaryButtonText="Готово"
      primaryButtonAction={handleDone}
    />
  );
};
