import { Children, ReactElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './authWizard.module.css';
import { stepSelectors } from '@/services/slices/stepSlice';
import { StepIndicator } from '@/shared/ui/stepIndicator/stepIndicator';
import { useSelector } from '@/services/store/store';

interface AuthWizardProps {
  children: ReactElement[];
}

export const AuthWizard = ({ children }: AuthWizardProps) => {
  const currentStep = useSelector(stepSelectors.currentStep);
  const totalSteps = useSelector(stepSelectors.totalSteps);
  const steps = Children.toArray(children);

  if (steps.length === 0) {
    return <div>No steps!</div>;
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 345 : -345,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 345 : -345,
      opacity: 0,
    }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.progressInfo}>
        <h2 className={styles.contentStep}>
          Шаг {currentStep + 1} из {totalSteps}
        </h2>
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      <div className={styles.formsContainer}>
        <AnimatePresence mode="wait" initial={false} custom={currentStep}>
          <motion.div
            key={currentStep}
            custom={currentStep}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 345, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className={styles.formWrapper}
          >
            {steps[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
