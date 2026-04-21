import styles from './stepIndicator.module.css';

type TStepIndicator = {
  currentStep: number;
  totalSteps: number;
};

export const StepIndicator = ({ currentStep, totalSteps }: TStepIndicator) => {
  return (
    <div className={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`${styles.step} ${index <= currentStep ? styles.active : ''}`}
        ></div>
      ))}
    </div>
  );
};
