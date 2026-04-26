import { FC, useState } from 'react';
import styles from './registerStepTwo.module.css';
import { TextInput } from '@/shared/ui/textInput/textInput';
import { CustomDatePicker } from '@/widgets/datePicker/datePicker';
import calendarIcon from '@/app/assets/static/images/icons/calendar.svg';
import plusIcon from '@/app/assets/static/images/icons/add.svg';
import { CustomSelect } from '@/shared/ui/customSelect/customSelect';
import { Autocomplete } from '@/shared/ui/autoComplete/autoComplete';
import { MultiSelect } from '@/shared/ui/multiSelect/multiSelect';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/button/button';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { russianCities } from '@/shared/lib/cities';
import userIcon from '@/app/assets/static/images/background/user-info.svg';
import {
  resetStepTwoData,
  TStepTwoData,
  updateStepTwoData,
} from '@/services/slices/registrationSlice';
import { useDispatch, useSelector } from '@/services/store/store';
import { RegistrationInfoPanel } from '@/shared/ui/registrationInfoPanel/registrationInfoPanel';
import { stepActions } from '@/services/slices/stepSlice';
import { getCategoriesSelector, getSubcategoriesByCategory } from '@/services/slices/skillsSlice';

export const RegisterStepTwo: FC = () => {
  const [isDatePickerOpen, setDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const dispatch = useDispatch();
  const defaultValues = useSelector(state => state.register.stepTwoData);
  const genders = ['Мужской', 'Женский'] as const;
  const schema = yup.object({
    avatar: yup.string().required('Загрузите аватар'),
    name: yup
      .string()
      .required('Укажите имя')
      .matches(/^[а-яёА-ЯЁ\s]+$/, 'Только кириллические символы')
      .min(3, 'Минимум 3 символа')
      .max(20, 'Максимум 20 символов'),
    birthdate: yup
      .string()
      .required('Укажите дату рождения')
      .test('valid-date', 'Введите корректную дату', value => {
        if (!value) return false;
        const [day, month, year] = value.split('.');
        const date = new Date(+year, +month - 1, +day);
        return !isNaN(date.getTime());
      })
      .test('not-future', 'Введите настоящую дату', value => {
        if (!value) return true;
        const [day, month, year] = value.split('.');
        const date = new Date(+year, +month - 1, +day);
        return date <= new Date();
      })
      .test('age-range', 'Вам должно быть более 12 лет', value => {
        if (!value) return true;
        const [day, month, year] = value.split('.');
        const birthDate = new Date(+year, +month - 1, +day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= 12 && age <= 100;
      }),
    city: yup
      .string()
      .required('Укажите город')
      .oneOf(russianCities, 'Выбранный город не существует'),
    gender: yup.string().required('Укажите пол').oneOf(genders, 'Выберите пол'),
    categories: yup
      .array()
      .min(1, 'Выберите хотя бы одну категорию')
      .required('Категория обязательна'),
    subcategories: yup
      .array()
      .min(1, 'Выберите хотя бы одну подкатегорию')
      .required('Подкатегория обязательна'),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    watch,
    control,
    trigger,
    setError,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    defaultValues: { ...defaultValues },
  });
  const rawSkills = useSelector(getCategoriesSelector);
  const skills = rawSkills.map(category => ({
    label: category,
    value: category,
  }));
  const selectedCategories = watch('categories') || '';
  const subcategoryOptions = useSelector(state =>
    getSubcategoriesByCategory(state, selectedCategories),
  ).map((category: string) => ({
    label: category,
    value: category,
  }));
  const onSubmit = (data: TStepTwoData) => {
    dispatch(resetStepTwoData());
    dispatch(
      updateStepTwoData({
        ...data,
        gender: data.gender,
      }),
    );
    dispatch(stepActions.nextStep());
  };

  const handleBack = () => {
    dispatch(resetStepTwoData());
    dispatch(stepActions.prevStep());
  };

  return (
    <div className={styles.registrationContainer}>
      <form className={styles.registrationForm} onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="avatar"
          control={control}
          render={({ fieldState }) => (
            <div className={styles.logoContainer}>
              <label htmlFor="avatar" className={styles.avatarLabel}>
                <img className={styles.avatarLabelPlusIcon} src={plusIcon} />
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                className={styles.avatarInput}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                      const base64 = reader.result as string;
                      setValue('avatar', base64, { shouldValidate: true });
                    };
                  }
                }}
                onBlur={() => trigger('avatar')}
              />
              {fieldState.error && <p className={styles.errorText}>{fieldState.error.message}</p>}
            </div>
          )}
        />
        <TextInput
          {...register('name')}
          id="name"
          title="Имя"
          placeholder="Введите ваше имя"
          className={styles.elementFull}
          error={errors.name?.message}
          onFocus={() => clearErrors('name')}
          onBlur={() => trigger('name')}
        />
        <Controller
          name="birthdate"
          control={control}
          render={({ field }) => {
            const value = field.value ?? '';
            return (
              <div className={styles.datePickerWrapper}>
                <TextInput
                  {...field}
                  type="text"
                  id="date"
                  title="Дата рождения"
                  placeholder="дд.мм.гггг"
                  icon={calendarIcon}
                  onClick={() => setDatePicker(true)}
                  value={value}
                  className={styles.fixedHeight}
                  error={errors.birthdate?.message}
                  hideError={isDatePickerOpen}
                />

                {isDatePickerOpen && (
                  <CustomDatePicker
                    selected={selectedDate}
                    onSelect={(date?: Date) => {
                      setSelectedDate(date);
                    }}
                    onCancelClick={() => {
                      setDatePicker(false);
                      setSelectedDate(undefined);
                      field.onChange('');
                      clearErrors('birthdate');
                    }}
                    onChooseClick={() => {
                      setDatePicker(false);
                      if (selectedDate) {
                        const formatted = selectedDate.toLocaleDateString('ru-RU');
                        field.onChange(formatted);
                        trigger('birthdate');
                      }
                    }}
                    onClose={() => {
                      setDatePicker(false);
                      trigger('birthdate');
                    }}
                    className={styles.datePickerPosition}
                    disabled={{ after: new Date() }}
                  />
                )}
              </div>
            );
          }}
        />
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <CustomSelect
              {...field}
              options={[
                { value: 'Не указан', label: 'Не указан' },
                { value: 'Мужской', label: 'Мужской' },
                { value: 'Женский', label: 'Женский' },
              ]}
              className={styles.fixedHeight}
              id="gender"
              title="Пол"
              placeholder="Не указан"
              error={errors.gender?.message}
              onFocus={() => clearErrors('gender')}
            />
          )}
        />
        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              className={styles.elementFull}
              id="city"
              title="Город"
              placeholder="Не указан"
              suggestions={russianCities}
              error={errors.city?.message || ''}
              onFocus={() => clearErrors('city')}
            />
          )}
        />
        <Controller
          name="categories"
          control={control}
          render={({ field }) => (
            <MultiSelect
              {...field}
              className={styles.elementFull}
              options={skills}
              title="Категория навыка, которому хотите научиться"
              id="skill"
              placeholder="Выберите категорию"
              value={field.value}
              onChange={value => {
                field.onChange(value);
                trigger('categories');
              }}
              error={errors.categories?.message}
              onFocus={() => clearErrors('categories')}
            />
          )}
        />
        <Controller
          name="subcategories"
          control={control}
          render={({ field }) => (
            <MultiSelect
              {...field}
              className={styles.elementFull}
              options={subcategoryOptions}
              title="Подкатегория навыка, которому хотите научиться"
              id="subSkill"
              placeholder="Выберите подкатегорию"
              value={field.value}
              onChange={value => {
                field.onChange(value);
                trigger('subcategories');
              }}
              error={errors.subcategories?.message}
              onFocus={() => {
                if (subcategoryOptions.length === 0) {
                  setError('subcategories', {
                    type: 'manual',
                    message: 'Сначала выберите хотя бы одну категорию',
                  });
                } else {
                  clearErrors('subcategories');
                }
              }}
            />
          )}
        />
        <div className={styles.buttonContainer}>
          <Button type="quaternary" onClick={handleBack}>
            Назад
          </Button>
          <Button type="primary" onClick={handleSubmit(onSubmit)}>
            Продолжить
          </Button>
        </div>
      </form>
      <RegistrationInfoPanel
        headerText="Расскажите немного о себе"
        icon={userIcon}
        text="Это поможет другим людям лучше вас узнать, чтобы выбрать для обмена"
      />
    </div>
  );
};
