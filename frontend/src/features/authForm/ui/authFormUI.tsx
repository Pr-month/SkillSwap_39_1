import { Button } from '@/shared/ui/button/button';
import styles from './authFormUI.module.css';

interface AuthFormUIProps {
  isFirstStage: boolean;
  textContent: {
    passwordPlaceholder: string;
    heading: string;
    text: string;
    buttonText: string;
  };
  showPassword: boolean;
  email: string;
  password: string;
  errors: {
    email: string;
    password: string;
    form: string;
    passwordIsFirstStage: string;
  };
  handleSubmit: (e: React.FormEvent) => void;
  togglePasswordVisibility: () => void;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordBlur: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEmailBlur: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AuthFormUI = ({
  isFirstStage,
  textContent,
  showPassword,
  email,
  password,
  errors,
  handleSubmit,
  togglePasswordVisibility,
  handleEmailChange,
  handlePasswordChange,
  handlePasswordBlur,
  handleEmailBlur,
}: AuthFormUIProps) => {
  return (
    <main className={styles.container}>
      <section aria-label={isFirstStage ? 'Авторизация' : 'Регистрация'} className={styles.block}>
        <div
          className={styles.buttonContainer}
          role="group"
          aria-label="Войти через социальные сети"
        >
          <Button type="quaternary" aria-label="Продолжить с Google">
            <span className={styles.contentButton}>
              <div className={styles.logoGoogle} aria-hidden="true"></div>
              <span>Продолжить с Google</span>
            </span>
          </Button>
          <Button type="quaternary" aria-label="Продолжить с Apple">
            <span className={styles.contentButton}>
              <div className={styles.logoApple} aria-hidden="true"></div>
              <span>Продолжить с Apple</span>
            </span>
          </Button>
        </div>

        <div className={styles.divider} aria-hidden="true">
          <span className={styles.dividerText}>или</span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <fieldset className={styles.fieldset}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="Введите email"
                autoComplete="email"
                aria-describedby="email-error"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
              />
              {isFirstStage && (
                <div className={`${styles.errorContainer} ${errors.email ? styles.withError : ''}`}>
                  {errors.email && <p className={styles.validationContent}>{errors.email}</p>}
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Пароль
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  placeholder={textContent.passwordPlaceholder}
                  autoComplete={isFirstStage ? 'current-password' : 'new-password'}
                  aria-describedby="password-error"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                />
                <button
                  type="button"
                  className={styles.toggleButton}
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  <div className={showPassword ? styles.eyeOpen : styles.eyeClosed}></div>
                </button>
              </div>
              {isFirstStage && (
                <div
                  className={`${styles.errorContainer} ${
                    errors.password || errors.passwordIsFirstStage ? styles.withError : ''
                  }`}
                >
                  {
                    <p
                      className={`${styles.validationContent} ${!errors.password ? styles.validationPass : ''}`}
                    >
                      {errors.password ? errors.password : errors.passwordIsFirstStage}
                    </p>
                  }
                </div>
              )}
            </div>
            {!isFirstStage && (
              <div className={`${styles.errorContainer} ${errors.form ? styles.withError : ''}`}>
                {errors.form && <p className={styles.validationContent}>{errors.form}</p>}
              </div>
            )}
          </fieldset>

          <div className={styles.authLinks}>
            <Button type="primary" disabled={!!(errors.email || errors.password)}>
              {textContent.buttonText}
            </Button>
            {!isFirstStage && (
              <a href="/register" className={styles.link}>
                Зарегистрироваться
              </a>
            )}
          </div>
        </form>
      </section>

      <aside className={styles.block} aria-labelledby="welcome-heading">
        <div className={styles.image} role="img" aria-label="Лампочка - символ идеи!"></div>
        <div className={styles.contentRightBlock}>
          <h2 id="welcome-heading" className={styles.contentHeading}>
            {textContent.heading}
          </h2>
          <p className={styles.contentText}>{textContent.text}</p>
        </div>
      </aside>
    </main>
  );
};
