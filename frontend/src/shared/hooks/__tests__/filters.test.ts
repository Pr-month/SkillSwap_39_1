import { describe, test, expect } from 'vitest';
import { RootState } from '@/services/store/store';
import { selectFilteredUsers } from '@/shared/hooks/useFilterCatalog';
import { User } from '@/entities/user/model/types';

// Мокируем пользователей
const mockUsers: User[] = [
  {
    _id: '1',
    name: 'Иван',
    image: 'image1.jpg',
    city: 'Москва',
    gender: 'male',
    birthdayDate: '1990-01-01',
    description: 'Опытный маркетолог',
    likes: [],
    email: 'ivan@example.com',
    canTeach: {
      category: 'Бизнес и карьера',
      subcategory: 'Маркетинг и реклама',
      subcategoryId: 'Бизнес и карьера-Маркетинг и реклама',
      name: 'SMM-продвижение',
      image: [],
      description: '',
      customSkillId: 'smm-id',
    },
    wantsToLearn: [
      {
        category: 'Иностранные языки',
        subcategory: 'Английский',
        subcategoryId: 'Иностранные языки-Английский',
        name: 'Деловой английский',
        customSkillId: 'eng-id',
      },
    ],
    createdAt: '2023-01-01',
  },
  {
    _id: '2',
    name: 'Мария',
    image: 'image2.jpg',
    city: 'Санкт-Петербург',
    gender: 'female',
    birthdayDate: '1992-05-15',
    description: 'Преподаватель английского',
    likes: ['1'],
    email: 'maria@example.com',
    canTeach: {
      category: 'Иностранные языки',
      subcategory: 'Английский',
      subcategoryId: 'Иностранные языки-Английский',
      name: 'Английский для IT',
      image: [],
      description: '',
      customSkillId: 'eng-it-id',
    },
    wantsToLearn: [
      {
        category: 'Бизнес и карьера',
        subcategory: 'Предпринимательство',
        subcategoryId: 'Бизнес и карьера-Предпринимательство',
        name: 'Стартапы',
        customSkillId: 'startup-id',
      },
    ],
    createdAt: '2023-02-01',
  },
  {
    _id: '3',
    name: 'Алексей',
    image: 'image3.jpg',
    city: 'Москва',
    gender: 'male',
    birthdayDate: '1988-11-20',
    description: 'Фитнес-тренер',
    likes: ['1', '2'],
    email: 'alexey@example.com',
    canTeach: {
      category: 'Здоровье и лайфстайл',
      subcategory: 'Физические тренировки',
      subcategoryId: 'Здоровье и лайфстайл-Физические тренировки',
      name: 'Функциональный тренинг',
      image: [],
      description: '',
      customSkillId: 'fitness-id',
    },
    wantsToLearn: [
      {
        category: 'Творчество и искусство',
        subcategory: 'Фотография',
        subcategoryId: 'Творчество и искусство-Фотография',
        name: 'Портретная съемка',
        customSkillId: 'photo-id',
      },
    ],
    createdAt: '2023-03-01',
  },
];

const mockState = (filters: Partial<RootState['filters']>, searchQuery = ''): RootState => ({
  catalog: {
    users: mockUsers,
    loading: false,
    error: null,
    searchQuery,
  },
  filters: {
    mode: 'all',
    gender: 'any',
    city: [],
    skill: [],
    ...filters,
  },
  register: {} as RootState['register'],
  exchange: {} as RootState['exchange'],
  skills: {} as RootState['skills'],
  step: {} as RootState['step'],
  likes: {} as RootState['likes'],
  authUser: {} as RootState['authUser'],
});

describe('Фильтрация карточек навыков', () => {
  describe('Фильтрация по режиму обучения', () => {
    test('Режим "can-teach" - только преподаватели', () => {
      const state = mockState({ mode: 'can-teach' });
      const result = selectFilteredUsers(state);
      expect(result.length).toBe(mockUsers.length);
    });

    test('Режим "want-to-learn" - только ученики', () => {
      const state = mockState({ mode: 'want-to-learn' });
      const result = selectFilteredUsers(state);
      expect(result.length).toBe(mockUsers.length);
    });
  });

  describe('Фильтрация по подкатегориям навыков', () => {
    test('Подкатегория "Маркетинг и реклама" в canTeach', () => {
      const state = mockState({
        mode: 'can-teach',
        skill: ['Маркетинг и реклама'],
      });
      const result = selectFilteredUsers(state);
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('1');
    });

    test('Подкатегория "Английский" в wantsToLearn', () => {
      const state = mockState({
        mode: 'want-to-learn',
        skill: ['Английский'],
      });
      const result = selectFilteredUsers(state);
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('1');
    });
  });

  describe('Фильтрация по полу', () => {
    test('Только мужчины', () => {
      const state = mockState({ gender: 'male' });
      const result = selectFilteredUsers(state);
      expect(result).toHaveLength(2);
    });

    test('Только женщины', () => {
      const state = mockState({ gender: 'female' });
      const result = selectFilteredUsers(state);
      expect(result).toHaveLength(1);
    });
  });

  describe('Фильтрация по городу', () => {
    test('Только Москва', () => {
      const state = mockState({ city: ['Москва'] });
      const result = selectFilteredUsers(state);
      expect(result).toHaveLength(2);
    });
  });

  describe('Поиск по тексту', () => {
    test('Поиск "английский"', () => {
      const state = mockState({}, 'английский');
      const result = selectFilteredUsers(state);
      expect(result).toHaveLength(2);
    });

    test('Поиск "тренинг"', () => {
      const state = mockState({}, 'тренинг');
      const result = selectFilteredUsers(state);
      expect(result).toHaveLength(1);
    });

    test('Регистронезависимый поиск', () => {
      const state = mockState({}, 'SMM');
      const result = selectFilteredUsers(state);
      expect(result).toHaveLength(1);
    });

    test('Нормализация буквы ё', () => {
      const state = mockState({}, 'съемка');
      const result = selectFilteredUsers(state);
      expect(result).toHaveLength(1);
    });
  });

  describe('Комбинированные фильтры', () => {
    test('Мужчины из Москвы, которые могут учить маркетингу', () => {
      const state = mockState({
        gender: 'male',
        city: ['Москва'],
        mode: 'can-teach',
        skill: ['Маркетинг и реклама'],
      });
      const result = selectFilteredUsers(state);
      expect(result).toHaveLength(1);
    });

    test('Женщины, которые хотят учить предпринимательству', () => {
      const state = mockState({
        gender: 'female',
        mode: 'want-to-learn',
        skill: ['Предпринимательство'],
      });
      const result = selectFilteredUsers(state);
      expect(result).toHaveLength(1);
    });
  });
});
