import { useState, useRef, ChangeEvent } from 'react';
import { PasswordChangeForm } from '../../components/PasswordChangeForm/PasswordChangeForm';
import { useDispatch, useSelector } from '@/services/store/store';
import { updateStepTwoData } from '@/services/slices/registrationSlice';
import { userSliceSelectors, userSliceActions } from '@/services/slices/authSlice';
import { Button } from '@/shared/ui/button/button';
import { russianCities } from '@/shared/lib/cities';
import { updateProfileApi } from '@/api/skillSwapApi';
import * as yup from 'yup';
import styles from './ProfileForm.module.css';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

type GenderType = 'Мужской' | 'Женский';

const formatDateForInput = (dateString?: string) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      const parts = dateString.split('.');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        return isoDate;
      }
      return '';
    }
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const profileSchema = yup.object().shape({
  name: yup
    .string()
    .required('Имя обязательно')
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(30, 'Имя должно содержать максимум 30 символов')
    .matches(/^[а-яА-ЯёЁ\s-]+$/, 'Имя должно содержать только кириллические буквы'),
  birthDate: yup
    .string()
    .required('Дата рождения обязательна')
    .test('valid-date', 'Неверная дата рождения', value => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test('age', 'Вам должно быть больше 12 лет', value => {
      if (!value) return false;
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 12;
    }),
  city: yup.string().required('Город обязателен').oneOf(russianCities, 'Выберите город из списка'),
  about: yup.string().max(500, 'Описание должно содержать максимум 500 символов'),
});

const passwordSchema = yup
  .string()
  .required('Пароль обязателен')
  .min(8, 'Пароль должен содержать минимум 8 символов')
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
    'Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру',
  );

export function ProfileForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const user = useSelector(userSliceSelectors.selectUser);
  const registrationData = JSON.parse(localStorage.getItem('registrationData') || '{}');

  const [formData, setFormData] = useState({
    email: registrationData?.email || user?.email || '',
    name: registrationData?.name || user?.name || '',
    birthDate: formatDateForInput(registrationData?.birthdate || user?.birthdayDate) || '',
    gender: (registrationData?.gender === 'Мужской' ? 'male' : 'female') as 'male' | 'female',
    city: registrationData?.city || user?.city || 'Москва',
    about: registrationData?.description || user?.description || '',
    avatar: registrationData?.avatar || user?.image || '',
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    form: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, birthDate: e.target.value }));
    if (errors.birthDate) {
      setErrors(prev => ({ ...prev, birthDate: '' }));
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordErrors(prev => ({ ...prev, [name]: '' }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validatePassword = async () => {
    try {
      await passwordSchema.validate(passwordData.newPassword);
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Пароли не совпадают');
      }
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setPasswordErrors(prev => ({ ...prev, newPassword: err.message }));
      } else if (err instanceof Error) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: err.message }));
      }
      return false;
    }
  };

  const handlePasswordSubmit = async () => {
    const isValid = await validatePassword();
    if (!isValid) return;

    try {
      setIsLoading(true);
      // Здесь должна быть логика обновления пароля на бэкенде
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '', form: '' });
    } catch (err) {
      setPasswordErrors(prev => ({
        ...prev,
        form: `Ошибка ${err} при изменении пароля. Проверьте текущий пароль.`,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await profileSchema.validate(formData, { abortEarly: false });
      setErrors({});
      setIsLoading(true);

      const gender: GenderType = formData.gender === 'male' ? 'Мужской' : 'Женский';

      const updatedUser = {
        id: user?._id || registrationData?.userId,
        name: formData.name,
        email: formData.email,
        birthdayDate: new Date(formData.birthDate).toISOString(),
        gender: formData.gender,
        city: formData.city,
        description: formData.about,
        image: formData.avatar,
      };

      // Обновляем данные в localStorage
      const updatedRegistrationData = {
        ...registrationData,
        name: formData.name,
        birthdate: new Date(formData.birthDate).toISOString(),
        gender,
        city: formData.city,
        description: formData.about,
        avatar: formData.avatar,
      };
      localStorage.setItem('registrationData', JSON.stringify(updatedRegistrationData));

      dispatch(
        updateStepTwoData({
          name: formData.name,
          birthdate: new Date(formData.birthDate).toISOString(),
          gender,
          city: formData.city,
        }),
      );

      if (user) {
        dispatch(
          userSliceActions.setUserData({
            ...user,
            ...updatedUser,
          }),
        );
      }

      login(updatedUser);

      const response = await updateProfileApi({
        name: formData.name,
        birthdate: new Date(formData.birthDate).toISOString(),
        gender,
        city: formData.city,
        description: formData.about,
      });

      if (!response.success) {
        throw new Error('Ошибка при обновлении профиля');
      }

      setIsLoading(false);
      navigate('/profile/details');
    } catch (err) {
      setIsLoading(false);

      if (err instanceof yup.ValidationError) {
        const newErrors = err.inner.reduce(
          (acc, curr) => {
            if (curr.path) {
              acc[curr.path] = curr.message;
            }
            return acc;
          },
          {} as Record<string, string>,
        );
        setErrors(newErrors);
      } else {
        setErrors(prev => ({ ...prev, form: 'Ошибка при сохранении данных' }));
        console.error('Profile update error:', err);
      }
    }
  };

  const isDirty =
    formData.name !== (registrationData?.name || user?.name) ||
    formatDateForInput(formData.birthDate) !==
      formatDateForInput(registrationData?.birthdate || user?.birthdayDate) ||
    formData.gender !== (registrationData?.gender === 'Мужской' ? 'male' : 'female') ||
    formData.city !== (registrationData?.city || user?.city) ||
    formData.about !== (registrationData?.description || user?.description) ||
    formData.avatar !== (registrationData?.avatar || user?.image);

  return (
    <div className={styles.profileForm}>
      <div className={styles.profileInputBlock}>
        <label>Почта</label>
        <div className={styles.profileEmailInputWrapper}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.profileEmailInput}
            disabled
          />
          <span className={`${styles.profileEditIcon} ${styles.iconEdit}`} />
        </div>
      </div>

      {isChangingPassword ? (
        <PasswordChangeForm
          passwordData={passwordData}
          passwordErrors={passwordErrors}
          showPassword={showPassword}
          isLoading={isLoading}
          onPasswordChange={handlePasswordChange}
          onTogglePasswordVisibility={togglePasswordVisibility}
          onSubmit={handlePasswordSubmit}
          onCancel={() => setIsChangingPassword(false)}
        />
      ) : (
        <button
          className={styles.profileChangePasswordBtn}
          type="button"
          onClick={() => setIsChangingPassword(true)}
        >
          Изменить пароль
        </button>
      )}

      <div className={styles.profileFormInputs}>
        <div className={styles.profileInputBlock}>
          <label>Имя</label>
          <div className={styles.profileEmailInputWrapper}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.profileEmailInput}
            />
            <span className={`${styles.profileEditIcon} ${styles.iconEdit}`} />
          </div>
          {errors.name && <div className={styles.errorText}>{errors.name}</div>}
        </div>
        <div className={styles.profileInputRow}>
          <div className={styles.profileInputBlock}>
            <label>Дата рождения</label>
            <div
              className={styles.profileDateInputWrapper}
              tabIndex={0}
              role="button"
              aria-label="Выбрать дату рождения"
              onClick={() => dateInputRef.current?.showPicker()}
              style={{ cursor: 'pointer' }}
            >
              <input
                type="date"
                name="birthDate"
                ref={dateInputRef}
                value={formData.birthDate}
                onChange={handleDateChange}
                className={styles.profileDateInput}
              />
              <span className={`${styles.profileCalendarIcon} ${styles.iconCalendar}`} />
            </div>
            {errors.birthDate && <div className={styles.errorText}>{errors.birthDate}</div>}
          </div>
          <div className={styles.profileInputBlock}>
            <label>Пол</label>
            <div className={styles.profileGenderInputWrapper}>
              <div className={styles.profileSelectInputWrapper}>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={styles.profileInputHalf}
                >
                  <option value="female">Женский</option>
                  <option value="male">Мужской</option>
                </select>
              </div>
              <span className={`${styles.profileChevronIcon} ${styles.iconChevron}`} />
            </div>
          </div>
        </div>
        <div className={styles.profileInputBlock}>
          <label>Город</label>
          <div
            className={styles.profileCityInputWrapper}
            style={{ width: '100%', maxWidth: '100%' }}
          >
            <div className={styles.profileSelectInputWrapper} style={{ width: '100%' }}>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                style={{ width: '100%' }}
              >
                {russianCities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <span className={`${styles.profileChevronIcon} ${styles.iconChevron}`} />
          </div>
          {errors.city && <div className={styles.errorText}>{errors.city}</div>}
        </div>
        <div className={styles.profileInputBlock}>
          <label>О себе</label>
          <div className={styles.profileAboutInputWrapper}>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows={5}
              className={styles.profileAboutTextarea}
            />
            <span className={`${styles.profileAboutEditIcon} ${styles.iconEdit}`} />
          </div>
          {errors.about && <div className={styles.errorText}>{errors.about}</div>}
        </div>
      </div>
      {errors.form && <div className={styles.errorText}>{errors.form}</div>}
      <div className={styles.profileSaveBtnWrapper}>
        <Button type="primary" onClick={handleSave} disabled={!isDirty || isLoading}>
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </div>
  );
}
