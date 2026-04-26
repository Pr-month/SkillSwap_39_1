import { useNavigate } from 'react-router-dom';
import { Modal } from '@/features/modal/modal';
import loginImage from '@/app/assets/static/images/icons/user-circle.svg';
import styles from './loginRequiredModal.module.css';

export const LoginRequiredModal = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    onClose();
  };

  const handleLogin = () => {
    onClose();
    navigate('/login'); // Перенаправление на страницу входа
  };

  return (
    <Modal
      title="Пожалуйста, войдите в аккаунт"
      type="confirmation"
      image={loginImage}
      className={styles.modal}
      onClose={onClose}
      description="Присоединяйтесь к SkillSwap и обменивайтесь знаниями и навыками с другими людьми"
      primaryButtonText="Вход"
      primaryButtonAction={handleLogin}
      secondaryButtonText="Отмена"
      secondaryButtonAction={handleCancel}
    />
  );
};
