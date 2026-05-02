import { getCategoriesApi, uploadFileApi } from '@/api/skillSwapApi';
import userIcon from '@/app/assets/static/images/background/user-info.svg';
import calendarIcon from '@/app/assets/static/images/icons/calendar.svg';
import plusIcon from '@/app/assets/static/images/icons/add.svg';
import { RegistrationGender } from '@/entities/auth/model/types';
import { Category } from '@/entities/category/model/types';
import { registerUser, TStepTwoData, updateStepTwoData } from '@/services/slices/registrationSlice';
import { stepActions } from '@/services/slices/stepSlice';
import { useDispatch, useSelector } from '@/services/store/store';
import { loginUser } from '@/services/thunk/authUser';
import { russianCities } from '@/shared/lib/cities';
import {
  formatBirthdateForApi,
  registrationGenderOptions,
} from '@/shared/lib/registration';
import { Button } from '@/shared/ui/button/button';
import { Autocomplete } from '@/shared/ui/autoComplete/autoComplete';
import { CustomSelect } from '@/shared/ui/customSelect/customSelect';
import { RegistrationInfoPanel } from '@/shared/ui/registrationInfoPanel/registrationInfoPanel';
import { TextInput } from '@/shared/ui/textInput/textInput';
import { CustomDatePicker } from '@/widgets/datePicker/datePicker';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import styles from './registerStepTwo.module.css';

type RegisterStepTwoFormValues = {
  avatar: string;
  name: string;
  birthdate: string;
  gender: RegistrationGender;
  city: string;
  about: string;
  parentCategoryId: string;
  categoryId: string;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (!error || typeof error !== 'object') {
    return fallbackMessage;
  }

  if ('message' in error) {
    const message = error.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string') {
      return message;
    }
  }

  return fallbackMessage;
};

const getDateFromValue = (value?: string) => {
  const formattedValue = value ? formatBirthdateForApi(value) : '';

  if (!formattedValue) {
    return undefined;
  }

  const parsedDate = new Date(formattedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate;
};

export const RegisterStepTwo = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultValues = useSelector(state => state.register.stepTwoData);
  const stepOneData = useSelector(state => state.register.stepOneData);
  const [isDatePickerOpen, setDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    getDateFromValue(defaultValues.birthdate),
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string>();
  const [avatarUploadError, setAvatarUploadError] = useState<string>();
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const availableCategoryIds = useMemo(
    () =>
      categories.flatMap(category =>
        category.children.length > 0
          ? category.children.map(child => child.id)
          : [category.id],
      ),
    [categories],
  );

  const schema = yup.object({
    avatar: yup.string().defined(),
    name: yup
      .string()
      .required('Укажите имя')
      .matches(/^[а-яёА-ЯЁ\s-]+$/, 'Только кириллические символы')
      .min(2, 'Минимум 2 символа')
      .max(100, 'Максимум 100 символов'),
    birthdate: yup
      .string()
      .required('Укажите дату рождения')
      .test('valid-date', 'Введите корректную дату', value => {
        if (!value) {
          return false;
        }

        return Boolean(formatBirthdateForApi(value));
      })
      .test('not-future', 'Введите настоящую дату', value => {
        const formattedValue = value ? formatBirthdateForApi(value) : '';

        if (!formattedValue) {
          return false;
        }

        return new Date(formattedValue) <= new Date();
      })
      .test('age-range', 'Вам должно быть более 12 лет', value => {
        const formattedValue = value ? formatBirthdateForApi(value) : '';

        if (!formattedValue) {
          return false;
        }

        const birthDate = new Date(formattedValue);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        return age >= 12 && age <= 100;
      }),
    city: yup
      .string()
      .required('Укажите город')
      .oneOf(russianCities, 'Выбранный город не существует'),
    gender: yup
      .mixed<RegistrationGender>()
      .required('Укажите пол')
      .oneOf(['male', 'female', 'unknown']),
    about: yup.string().max(255, 'Максимум 255 символов').defined(),
    parentCategoryId: yup.string().required('Выберите категорию'),
    categoryId: yup
      .string()
      .required('Выберите подкатегорию')
      .test('category-id', 'Выберите корректную категорию', value => {
        if (!value) {
          return false;
        }

        if (availableCategoryIds.length === 0) {
          return true;
        }

        return availableCategoryIds.includes(value);
      }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    watch,
    control,
    trigger,
    setValue,
    setError,
  } = useForm<RegisterStepTwoFormValues>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      avatar: defaultValues.avatar ?? '',
      name: defaultValues.name ?? '',
      birthdate: defaultValues.birthdate ?? '',
      gender: defaultValues.gender ?? 'unknown',
      city: defaultValues.city ?? '',
      about: defaultValues.about ?? '',
      parentCategoryId: '',
      categoryId: defaultValues.categoryId ?? '',
    },
  });

  const selectedParentId = watch('parentCategoryId');
  const avatarUrl = watch('avatar');

  const parentCategoryOptions = useMemo(
    () =>
      categories.map(category => ({
        label: category.name,
        value: category.id,
      })),
    [categories],
  );

  const selectedParentCategory = useMemo(
    () => categories.find(category => category.id === selectedParentId),
    [categories, selectedParentId],
  );

  const childCategoryOptions = useMemo(() => {
    if (!selectedParentCategory) {
      return [];
    }

    const categoryOptions =
      selectedParentCategory.children.length > 0
        ? selectedParentCategory.children
        : [selectedParentCategory];

    return categoryOptions.map(category => ({
      label: category.name,
      value: category.id,
    }));
  }, [selectedParentCategory]);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(undefined);
        const categoriesData = await getCategoriesApi();

        if (!isMounted) {
          return;
        }

        setCategories(categoriesData);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setCategoriesError(
          getErrorMessage(error, 'Не удалось загрузить категории регистрации'),
        );
      } finally {
        if (isMounted) {
          setCategoriesLoading(false);
        }
      }
    };

    void fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (categories.length === 0) {
      return;
    }

    const currentCategoryId = watch('categoryId') || defaultValues.categoryId;

    if (!currentCategoryId) {
      return;
    }

    const parentCategory = categories.find(
      category =>
        category.id === currentCategoryId ||
        category.children.some(child => child.id === currentCategoryId),
    );

    if (!parentCategory) {
      return;
    }

    setValue('parentCategoryId', parentCategory.id, {
      shouldDirty: false,
      shouldValidate: false,
    });
    setValue('categoryId', currentCategoryId, {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [categories, defaultValues.categoryId, setValue, watch]);

  const handleBack = () => {
    dispatch(stepActions.prevStep());
  };

  const handleAvatarUpload = async (file?: File) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAvatarUploadError('Можно загрузить только изображение');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarUploadError('Максимальный размер файла 2MB');
      return;
    }

    try {
      setIsAvatarUploading(true);
      setAvatarUploadError(undefined);
      const uploadedFile = await uploadFileApi(file);
      setValue('avatar', uploadedFile.url, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      setAvatarUploadError(
        getErrorMessage(error, 'Не удалось загрузить аватар'),
      );
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const onSubmit = async (data: RegisterStepTwoFormValues) => {
    if (!stepOneData.email || !stepOneData.password) {
      dispatch(stepActions.goToStep(0));
      return;
    }

    const birthdate = formatBirthdateForApi(data.birthdate);

    if (!birthdate) {
      setError('birthdate', {
        type: 'manual',
        message: 'Введите корректную дату',
      });
      return;
    }

    const preparedStepTwoData: TStepTwoData = {
      avatar: data.avatar || undefined,
      name: data.name.trim(),
      birthdate,
      gender: data.gender,
      city: data.city,
      about: data.about.trim() || undefined,
      categoryId: data.categoryId,
    };

    const registrationData = {
      ...stepOneData,
      ...preparedStepTwoData,
    };

    try {
      setSubmitError(undefined);
      dispatch(updateStepTwoData(preparedStepTwoData));
      await dispatch(registerUser(registrationData)).unwrap();
      void dispatch(
        loginUser({
          email: stepOneData.email,
          password: stepOneData.password,
        }),
      );
      navigate('/register/success', {
        state: { background: location },
      });
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, 'Не удалось завершить регистрацию'),
      );
    }
  };

  return (
    <div className={styles.registrationContainer}>
      <form className={styles.registrationForm} onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="avatar"
          control={control}
          render={({ field, fieldState }) => (
            <div className={styles.logoContainer}>
              <label htmlFor="avatar" className={styles.avatarLabel}>
                <img className={styles.avatarLabelPlusIcon} src={plusIcon} />
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                className={styles.avatarInput}
                onChange={async event => {
                  await handleAvatarUpload(event.target.files?.[0]);
                  field.onBlur();
                }}
              />
              {isAvatarUploading && (
                <p className={styles.errorText}>Загружаем аватар...</p>
              )}
              {!isAvatarUploading && avatarUrl && (
                <p className={styles.errorText}>Аватар успешно загружен</p>
              )}
              {(avatarUploadError || fieldState.error?.message) && (
                <p className={styles.errorText}>
                  {avatarUploadError || fieldState.error?.message}
                </p>
              )}
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
                        const formattedDate =
                          selectedDate.toLocaleDateString('ru-RU');
                        field.onChange(formattedDate);
                        void trigger('birthdate');
                      }
                    }}
                    onClose={() => {
                      setDatePicker(false);
                      void trigger('birthdate');
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
              options={registrationGenderOptions}
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
              value={field.value ?? ''}
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
        <TextInput
          {...register('about')}
          id="about"
          title="О себе"
          placeholder="Коротко расскажите о себе"
          className={styles.elementFull}
          error={errors.about?.message}
          onFocus={() => clearErrors('about')}
          onBlur={() => trigger('about')}
          type="textarea"
        />
        <Controller
          name="parentCategoryId"
          control={control}
          render={({ field }) => (
            <CustomSelect
              {...field}
              className={styles.elementFull}
              options={parentCategoryOptions}
              title="Категория, которой хотите научиться"
              id="parent-category"
              placeholder={
                categoriesLoading ? 'Загрузка категорий...' : 'Выберите категорию'
              }
              value={field.value}
              onChange={value => {
                field.onChange(value);
                clearErrors('parentCategoryId');
                clearErrors('categoryId');

                const parentCategory = categories.find(
                  category => category.id === value,
                );

                if (!parentCategory) {
                  setValue('categoryId', '', { shouldValidate: true });
                  return;
                }

                if (parentCategory.children.length === 0) {
                  setValue('categoryId', parentCategory.id, {
                    shouldValidate: true,
                  });
                  return;
                }

                setValue('categoryId', '', { shouldValidate: true });
              }}
              error={errors.parentCategoryId?.message || categoriesError}
              onFocus={() => clearErrors('parentCategoryId')}
            />
          )}
        />
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <CustomSelect
              {...field}
              className={styles.elementFull}
              options={childCategoryOptions}
              title="Подкатегория"
              id="category"
              placeholder={
                selectedParentCategory
                  ? 'Выберите подкатегорию'
                  : 'Сначала выберите категорию'
              }
              value={field.value}
              onChange={value => {
                field.onChange(value);
                clearErrors('categoryId');
              }}
              error={errors.categoryId?.message}
              onFocus={() => {
                if (!selectedParentCategory) {
                  setError('categoryId', {
                    type: 'manual',
                    message: 'Сначала выберите категорию',
                  });
                } else {
                  clearErrors('categoryId');
                }
              }}
            />
          )}
        />
        {submitError && <p className={styles.errorText}>{submitError}</p>}
        <div className={styles.buttonContainer}>
          <Button type="quaternary" onClick={handleBack} htmlType="button">
            Назад
          </Button>
          <Button type="primary" htmlType="submit">
            Зарегистрироваться
          </Button>
        </div>
      </form>
      <RegistrationInfoPanel
        headerText="Расскажите немного о себе"
        icon={userIcon}
        text="Это поможет другим людям лучше вас узнать и сразу увидеть, чему вы хотите научиться"
      />
    </div>
  );
};
