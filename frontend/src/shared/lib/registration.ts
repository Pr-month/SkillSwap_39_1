import { RegisterDto, RegistrationGender } from '@/entities/auth/model/types';

export const registrationGenderOptions: Array<{
  value: RegistrationGender;
  label: string;
}> = [
  { value: 'unknown', label: 'Не указан' },
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
];

export const STRONG_PASSWORD_HINT =
  'Пароль должен содержать минимум 8 символов, заглавную и строчную букву, цифру и спецсимвол';

export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,50}$/;

export const isStrongPassword = (value: string) =>
  STRONG_PASSWORD_REGEX.test(value);

export const formatBirthdateForApi = (
  value: string,
): RegisterDto['birthdate'] | '' => {
  if (!value) {
    return '';
  }

  const trimmedValue = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmedValue)) {
    const [day, month, year] = trimmedValue.split('.');
    return `${year}-${month}-${day}`;
  }

  const parsedDate = new Date(trimmedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toISOString().split('T')[0];
};
