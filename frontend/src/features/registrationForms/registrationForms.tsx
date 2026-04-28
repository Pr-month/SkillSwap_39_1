import { useSteps } from '@/shared/hooks/useSteps';
import { AuthFormContainer } from '../authForm/container/authFormContainer';
import { AuthWizard } from '../authWizard/authWizard';
import styles from './registrationForms.module.css';
import { Button } from '@/shared/ui/button/button';
import { useNavigate } from 'react-router-dom';
import { RegisterStepTwo } from '@/pages/registerStepTwo/registerStepTwo';
import { RegisterStepThree } from '@/pages/registerStepThree/registerStepThree';

const RegistrationForms = ({ isRegister = true }) => {
  const forms = [
    <AuthFormContainer key="step1" isFirstStage={true} />,
    <RegisterStepTwo key="step2" />,
    <RegisterStepThree key="step3" />,
  ];

  const navigate = useNavigate();

  useSteps(forms.length);

  const onClose = () => {
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.logo} onClick={onClose}></div>
        <div className={styles.buttonContainer}>
          <Button type="tertiary" onClick={onClose}>
            Закрыть <div className={styles.close}></div>
          </Button>
        </div>
      </div>
      {isRegister ? (
        <AuthWizard>{forms}</AuthWizard>
      ) : (
        <div className={styles.container}>
          <h2 className={styles.content}>Вход</h2>
          <AuthFormContainer isFirstStage={false} />
        </div>
      )}
    </div>
  );
};

export default RegistrationForms;
