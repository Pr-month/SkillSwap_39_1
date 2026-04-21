import { PAGE_TEXTS } from '@/features/authForm/ui/authForm';
import { AuthFormUI } from '@/features/authForm/ui/authFormUI';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from '@/services/store/store';
import { stepActions } from '@/services/slices/stepSlice';
import { loginUser } from '@/services/thunk/authUser';
import { updateStepOneData } from '@/services/slices/registrationSlice';

export const AuthFormContainer = ({ isFirstStage = true }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    passwordIsFirstStage: 'Пароль должен содержать не менее 8 знаков',
    form: '',
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const dispatch = useDispatch();

  const textContent = isFirstStage ? PAGE_TEXTS.registration : PAGE_TEXTS.firstStage;

  const validateEmail = (value: string) => {
    if (!value.trim()) return 'Поле Email обязательно для заполнения';
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) return 'Некорректный формат email';
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value.trim()) return 'Поле Пароль обязательно для заполнения';
    if (value.length < 8) return 'Пароль должен содержать минимум 8 символов';
    return '';
  };

  const validateField = useCallback(() => {
    const newErrors = {
      email: touched.email ? validateEmail(email) : '',
      password: touched.password ? validatePassword(password) : '',
      passwordIsFirstStage: !validatePassword(password)
        ? 'Надёжный'
        : 'Пароль должен содержать не менее 8 знаков',
      form: errors.form,
    };

    const shouldShowFormError = newErrors.email || newErrors.password;

    setErrors({
      ...newErrors,
      form: shouldShowFormError
        ? 'Email или пароль введён неверно. Пожалуйста проверьте правильность введённых данных'
        : newErrors.form,
    });

    if (!shouldShowFormError) {
      setErrors({
        email: '',
        password: '',
        passwordIsFirstStage: newErrors.passwordIsFirstStage,
        form: '',
      });
    }
  }, [email, password, touched.email, touched.password, errors.form]);

  useEffect(() => {
    if (touched.email || touched.password) {
      validateField();
    }
  }, [touched.email, touched.password, validateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true,
    });

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
        passwordIsFirstStage: '',
        form: 'Email или пароль введён неверно. Пожалуйста проверьте правильность введённых данных',
      });
      return;
    }

    if (isFirstStage) {
      dispatch(updateStepOneData({ email, password }));
      dispatch(stepActions.nextStep());
    } else {
      try {
        await dispatch(loginUser({ email, password })).unwrap();
      } catch {
        setErrors(prev => ({
          ...prev,
          form: 'Пользователь не зарегистрирован или неверные данные',
        }));
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleEmailBlur = () => {
    if (!touched.email) setTouched(prev => ({ ...prev, email: true }));
  };

  const handlePasswordBlur = () => {
    if (!touched.password) setTouched(prev => ({ ...prev, password: true }));
  };

  return (
    <AuthFormUI
      isFirstStage={isFirstStage}
      textContent={textContent}
      showPassword={showPassword}
      email={email}
      password={password}
      errors={errors}
      handleSubmit={handleSubmit}
      togglePasswordVisibility={togglePasswordVisibility}
      handleEmailChange={handleEmailChange}
      handlePasswordChange={handlePasswordChange}
      handleEmailBlur={handleEmailBlur}
      handlePasswordBlur={handlePasswordBlur}
    />
  );
};