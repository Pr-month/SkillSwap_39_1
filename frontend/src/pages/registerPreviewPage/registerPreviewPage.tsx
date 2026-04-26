import { ProposalPreviewModal } from '@/features/auth/proposalPreviewModal/proposalPreviewModal';
import { registerUser } from '@/services/slices/registrationSlice';
import { useDispatch, useSelector } from '@/services/store/store';
import { loginUser } from '@/services/thunk/authUser';
import { TeachableSkill } from '@/widgets/skillCard/skillCard';
import { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RegisterPreviewPage: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { stepOneData, stepTwoData, stepThreeData } = useSelector(state => state.register);
  const isOpen = Object.values(stepThreeData).every(
    value => value !== undefined && (Array.isArray(value) ? value.length > 0 : true),
  );
  const skill = {
    name: stepThreeData.skillName,
    category: stepThreeData.skillCategory,
    subcategory: stepThreeData.skillSubCategory,
    subcategoryId: stepThreeData.subcategoryId,
    description: stepThreeData.description,
    image: stepThreeData.images,
    customSkillId: stepThreeData.customSkillId,
  } as TeachableSkill;

  return (
    <ProposalPreviewModal
      userId={stepThreeData.userId || ''}
      skill={skill}
      isOpen={isOpen}
      onClose={() => {
        navigate('/register');
      }}
      onEdit={() => {
        navigate('/register');
      }}
      onSuccess={() => {
        dispatch(
          registerUser({
            ...stepOneData,
            ...stepTwoData,
            ...stepThreeData,
          }),
        )
          .unwrap()
          .then(() => {
            // Вход
            dispatch(
              loginUser({
                email: stepOneData.email || '',
                password: stepOneData.password || '',
              }),
            );
          });
        navigate('/register/success', {
          state: { background: location },
        });
      }}
    />
  );
};

export default RegisterPreviewPage;
