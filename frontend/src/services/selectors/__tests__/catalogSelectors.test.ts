import type { RootState } from '@/services/store/store';
import { RequestStatus } from '@/entities/auth/model/types';
import { selectCatalogItems, selectCatalogLoading } from '../catalogSelectors';

describe('catalogSelectors', () => {
  const mockState: RootState = {
    register: {
      stepOneData: { email: '', password: '' },
      stepTwoData: {
        name: '',
        birthdate: '',
        gender: 'Мужской',
        city: 'Москва',
        categories: [],
        subcategories: [],
        avatar: '',
      },
      stepThreeData: {
        skillName: '',
        skillCategory: 'Бизнес и карьера',

        skillSubCategory: 'Проектное управление',
        description: '',
        images: [],
        customSkillId: '',
        subcategoryId: '',
        userId: '',
      },
      error: undefined,
      loading: false,
    },
    catalog: {
      users: [
        {
          _id: '1',
          name: 'User1',
          createdAt: '',
          image: '',
          city: '',
          gender: 'male',
          birthdayDate: '',
          description: '',
          likes: [],
          canTeach: {
            name: '',
            image: [],
            description: '',
            customSkillId: '',
            category: 'Бизнес и карьера',
            subcategory: 'Управление командой',
            subcategoryId: '',
          },
          wantsToLearn: [],
        },
        {
          _id: '2',
          name: 'User2',
          createdAt: '',
          image: '',
          city: '',
          gender: 'male',
          birthdayDate: '',
          description: '',
          likes: [],
          canTeach: {
            name: '',
            image: [],
            description: '',
            customSkillId: '',
            category: 'Бизнес и карьера',
            subcategory: 'Управление командой',
            subcategoryId: '',
          },
          wantsToLearn: [],
        },
      ],
      loading: true,
      error: null,
      searchQuery: '',
    },
    exchange: { requests: [], loading: false, error: null },
    skills: { skills: [], loading: false, error: undefined },
    step: { currentStep: 0, totalSteps: 0 },
    filters: { mode: 'all', gender: 'any', city: [], skill: [] },
    likes: { likedItems: {}, loading: false, error: null },
    authUser: { data: null, authStatus: RequestStatus.Idle, userCheck: false },
  };

  test('selectCatalogItems возвращает массив пользователей', () => {
    expect(selectCatalogItems(mockState)).toEqual([
      mockState.catalog.users[0],
      mockState.catalog.users[1],
    ]);
  });

  test('selectCatalogLoading возвращает состояние загрузки', () => {
    expect(selectCatalogLoading(mockState)).toBe(true);
  });
});
