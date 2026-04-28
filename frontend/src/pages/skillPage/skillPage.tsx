import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import SkillCard, { TeachableSkill } from '@/widgets/skillCard/skillCard';
import SameOffers from '@/widgets/sameOffers/sameOffers';
import UserInfo from '@/widgets/userInfo/userInfo';
import { usersData } from '@/shared/mocks/usersData';
import styles from './skillPage.module.css';
import { LoginRequiredModal } from '@/features/loginRequiredModal/loginRequiredModal';
import { AlreadyProposedModal } from '@/features/alreadyProposedModal/alreadyProposedModal';

const SkillPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [modalState, setModalState] = useState<'none' | 'login' | 'alreadyProposed'>('none');

  useEffect(() => {
    if (id) {
      localStorage.setItem('lastViewedSkillId', id);
    }
  }, [id]);

  const currentUser = useMemo(() => {
    return usersData.find(user => user._id === id);
  }, [id]);

  const isAuthenticated = true;

  const handleExchangeProposal = useCallback(() => {
    if (!isAuthenticated) {
      setModalState('login');
    } else {
      setModalState('alreadyProposed');
    }
  }, [isAuthenticated]);

  const renderModal = () => {
    const closeModal = () => setModalState('none');
    switch (modalState) {
      case 'login':
        return <LoginRequiredModal onClose={closeModal} />;
      case 'alreadyProposed':
        return <AlreadyProposedModal onClose={closeModal} />;
      case 'none':
      default:
        return null;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!id) {
    return <div className={styles.error}>Неверный ID</div>;
  }
  if (!currentUser) {
    return <div className={styles.error}>Пользователь не найден</div>;
  }
  if (!currentUser.canTeach) {
    return <div className={styles.error}>Нет доступного навыка</div>;
  }

  const teachableSkill: TeachableSkill = {
    customSkillId: currentUser.canTeach.customSkillId,
    name: currentUser.canTeach.name,
    category: currentUser.canTeach.category,
    description: currentUser.canTeach.description,

    image: currentUser.canTeach.image as string[],
  };

  return (
    <>
      <div className={styles.skillPage}>
        <div className={styles.userOffer}>
          <UserInfo user={currentUser} />
          <SkillCard
            skill={teachableSkill}
            ownerId={currentUser._id}
            ownerName={currentUser.name}
            onExchangeClick={handleExchangeProposal}
          />
        </div>
        <SameOffers currentUser={currentUser} users={usersData} />
      </div>

      {modalState !== 'none' && renderModal()}
    </>
  );
};

export default SkillPage;
