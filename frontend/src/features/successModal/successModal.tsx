import { Modal } from '@/features/modal/modal';
import done from '@/app/assets/static/images/icons/successDone.svg';
import { useLocation, useNavigate } from 'react-router-dom';

const SuccessModal = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleDone = () => {
    if (typeof onClose !== 'function') {
      console.error('onClose is not a function');
      navigate('/');
      return;
    }

    const saved = localStorage.getItem('postProposalRedirect');
    let redirectData = null;
    const background = location.state?.background;
    const isFromRegistration = background?.pathname?.includes('/register');
    try {
      redirectData = saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to parse postProposalRedirect', e);
    }

    if (isFromRegistration) {
      navigate('/', { replace: true });
    } else if (redirectData?.userId) {
      navigate(`/skill/${redirectData.userId}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }

    localStorage.removeItem('postProposalRedirect');
    localStorage.removeItem('registrationUserId');
  };

  return (
    <Modal
      title={'Ваше предложение создано'}
      type="confirmation"
      image={done}
      onClose={handleDone}
      primaryButtonText="Готово"
      primaryButtonAction={handleDone}
    />
  );
};

export default SuccessModal;
