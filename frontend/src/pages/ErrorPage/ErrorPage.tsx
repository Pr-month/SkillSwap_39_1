import icon404 from '@/app/assets/static/images/background/error-404.svg';
import icon500 from '@/app/assets/static/images/background/error-500.svg';
import { ErrorBlock } from '@/shared/ui/errorBlock/errorBlock';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ErrorPage.module.css';

type ErrorPageProps = {
  type: '500' | '404';
};

const errorConfig = {
  '500': {
    header: 'На сервере произошла ошибка',
    text: 'Попробуйте позже или вернитесь на главную страницу',
    icon: icon500,
    alt: 'Изображение с кодом ошибки 500 - ошибка сервера',
  },
  '404': {
    header: 'Страница не найдена',
    text: 'К сожалению, эта страница недоступна. Вернитесь на главную страницу или попробуйте позже',
    icon: icon404,
    alt: 'Изображение с кодом ошибки 404 - страница не найдена',
  },
};

const ErrorPage: FC<ErrorPageProps> = ({ type }) => {
  const config = errorConfig[type];
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <img className={styles.icon} src={config.icon} alt={config.alt} />
      <ErrorBlock
        header={config.header}
        text={config.text}
        onHomeClick={() => {
          navigate('/');
        }}
      ></ErrorBlock>
    </div>
  );
};

export default ErrorPage;
