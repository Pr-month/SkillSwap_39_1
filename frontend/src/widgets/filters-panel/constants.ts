import { ExperienceOption, GenderOption } from '@/entities/user/model/types';

export const experienceOptions: ExperienceOption[] = [
  { value: 'all', label: 'Все' },
  { value: 'want-to-learn', label: 'Хочу научиться' },
  { value: 'can-teach', label: 'Могу научить' },
];

export const genderOptions: GenderOption[] = [
  { value: 'any', label: 'Не имеет значения' },
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
];
