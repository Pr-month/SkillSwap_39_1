import { describe, it, expect, beforeEach } from 'vitest';
import {
  skillsReducer,
  getSkills,
  getSkillsSelector,
  getCategoriesSelector,
  getSkillsBySubcategoryPrefixSelector,
  getSubcategoriesByCategory,
  getSubcategoryIdByName,
} from '../skillsSlice';
import { Skill } from '@/entities/skill/model/types';

const mockSkills: Skill[] = [
  {
    category: 'Бизнес и карьера',
    subcategory: 'Продажи и переговоры',
    subcategoryId: 'bc003',
  },
  {
    category: 'Творчество и искусство',
    subcategory: 'Видеомонтаж',
    subcategoryId: 'ca003',
  },
  {
    category: 'Иностранные языки',
    subcategory: 'Японский',
    subcategoryId: 'fl006',
  },
];

describe('skillsSlice', () => {
  let initialState: ReturnType<typeof skillsReducer>;

  beforeEach(() => {
    initialState = skillsReducer(undefined, { type: '' });
  });

  it('должен возвращать начальное состояние', () => {
    expect(initialState).toEqual({
      skills: [],
      loading: false,
      error: undefined,
    });
  });

  describe('getSkills async thunk', () => {
    it('pending: должен установить loading = true', () => {
      const newState = skillsReducer(initialState, { type: getSkills.pending.type });
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeUndefined();
    });

    it('fulfilled: должен сохранить полученные навыки и отключить loading', () => {
      const newState = skillsReducer(initialState, {
        type: getSkills.fulfilled.type,
        payload: mockSkills,
      });
      expect(newState.skills).toEqual(mockSkills);
      expect(newState.loading).toBe(false);
    });

    it('rejected: должен установить ошибку и отключить loading', () => {
      const newState = skillsReducer(initialState, { type: getSkills.rejected.type });
      expect(newState.error).toBe('Не удалось загрузить данные о навыках');
      expect(newState.loading).toBe(false);
    });
  });

  describe('селекторы', () => {
    const state = {
      skills: {
        skills: mockSkills,
        loading: false,
        error: undefined,
      },
    };

    it('getSkillsSelector: должен вернуть все навыки', () => {
      const result = getSkillsSelector(state);
      expect(result).toEqual(mockSkills);
    });

    it('getCategoriesSelector: должен вернуть уникальные категории', () => {
      const result = getCategoriesSelector(state);
      expect(result).toEqual(['Бизнес и карьера', 'Творчество и искусство', 'Иностранные языки']);
    });

    it('getSkillsBySubcategoryPrefixSelector: фильтрует по префиксу subcategoryId', () => {
      const result = getSkillsBySubcategoryPrefixSelector(state, 'ca');
      expect(result).toEqual([
        {
          category: 'Творчество и искусство',
          subcategory: 'Видеомонтаж',
          subcategoryId: 'ca003',
        },
      ]);
    });
    it('getSubcategoriesByCategory: возвращает подкатегории по одной категории', () => {
      const result = getSubcategoriesByCategory(state, ['Иностранные языки']);
      expect(result).toEqual(['Японский']);
    });

    it('getSubcategoriesByCategory: возвращает подкатегории по нескольким категориям', () => {
      const result = getSubcategoriesByCategory(state, [
        'Бизнес и карьера',
        'Творчество и искусство',
      ]);
      expect(result).toEqual(['Продажи и переговоры', 'Видеомонтаж']);
    });

    it('getSubcategoryIdByName: возвращает subcategoryId по названию подкатегории', () => {
      const result = getSubcategoryIdByName(state, 'Японский');
      expect(result).toBe('fl006');
    });

    it('getSubcategoryIdByName: возвращает undefined, если подкатегория не найдена', () => {
      const result = getSubcategoryIdByName(state, 'Гитара');
      expect(result).toBeUndefined();
    });
  });
});
