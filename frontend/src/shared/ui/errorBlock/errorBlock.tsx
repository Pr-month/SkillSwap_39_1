import { FC } from 'react';
import { Button } from '../button/button';
import styles from './errorBlock.module.css';

type ErrorBlockProps = {
  header: string;
  text: string;
  onReportClick?: () => void;
  onHomeClick: () => void;
};

export const ErrorBlock: FC<ErrorBlockProps> = ({ header, text, onReportClick, onHomeClick }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.header}>{header}</h2>
      <p className={styles.text}>{text}</p>
      <Button type="secondary" onClick={onReportClick}>
        Сообщить об ошибке
      </Button>
      <Button type="primary" onClick={onHomeClick}>
        На главную
      </Button>
    </div>
  );
};
