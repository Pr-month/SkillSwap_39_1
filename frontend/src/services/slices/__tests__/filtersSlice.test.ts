import { describe, test, expect } from 'vitest';
import filtersReducer, {
  setMode,
  setGender,
  setCities,
  setSkills,
  removeFilter,
  resetFilters,
} from '@/services/slices/filtersSlice';

// Создаем корректный initialState на основе типа из слайса
const initialState = {
  mode: 'all' as const,
  gender: 'any' as const,
  city: [] as string[],
  skill: [] as string[],
};

describe('filtersSlice', () => {
  test('Должен обрабатывать setMode', () => {
    const action = setMode('can-teach');
    const state = filtersReducer(initialState, action);
    expect(state.mode).toBe('can-teach');
  });

  test('Должен обрабатывать setGender', () => {
    const action = setGender('female');
    const state = filtersReducer(initialState, action);
    expect(state.gender).toBe('female');
  });

  test('Должен обрабатывать setCities', () => {
    const action = setCities(['Москва']);
    const state = filtersReducer(initialState, action);
    expect(state.city).toEqual(['Москва']);
  });

  test('Должен обрабатывать setSkills', () => {
    const action = setSkills(['Маркетинг и реклама']);
    const state = filtersReducer(initialState, action);
    expect(state.skill).toEqual(['Маркетинг и реклама']);
  });

  test('Должен обрабатывать removeFilter для mode', () => {
    const stateWithMode = { ...initialState, mode: 'can-teach' as const };
    const action = removeFilter({ type: 'mode' });
    const state = filtersReducer(stateWithMode, action);
    expect(state.mode).toBe('all');
  });

  test('Должен обрабатывать removeFilter для skill', () => {
    const stateWithSkill = { ...initialState, skill: ['Маркетинг и реклама'] };
    const action = removeFilter({ type: 'skill', value: 'Маркетинг и реклама' });
    const state = filtersReducer(stateWithSkill, action);
    expect(state.skill).toEqual([]);
  });

  test('Должен обрабатывать resetFilters', () => {
    const modifiedState = {
      mode: 'can-teach' as const,
      gender: 'female' as const,
      city: ['Москва'],
      skill: ['Маркетинг и реклама'],
    };
    const state = filtersReducer(modifiedState, resetFilters());
    expect(state).toEqual(initialState);
  });
});
