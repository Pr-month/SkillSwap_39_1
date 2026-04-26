import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { Reducer } from '@reduxjs/toolkit';
import { FiltersPanel } from '@/widgets/filters-panel/filtersPanel';
import filtersReducer from '@/services/slices/filtersSlice';
import { catalogReducer } from '@/services/slices/catalogSlice';
import { ExperienceOption, GenderOption } from '@/entities/user/model/types';

type FiltersState = {
  mode: ExperienceOption['value'];
  gender: GenderOption['value'];
  city: string[];
  skill: string[];
};

describe('FiltersPanel', () => {
  const mockSkillsCategories = {
    'Бизнес и карьера': ['Маркетинг и реклама'] as readonly string[],
    'Иностранные языки': ['Английский'] as readonly string[],
  };

  const mockCities = {
    Москва: ['Москва'] as readonly string[],
    'Санкт-Петербург': ['Санкт-Петербург'] as readonly string[],
  };

  const createStore = (initialFilters?: Partial<FiltersState>) => {
    return configureStore({
      reducer: {
        filters: filtersReducer as Reducer<FiltersState>,
        catalog: catalogReducer,
      },
      preloadedState: {
        catalog: {
          users: [],
          loading: false,
          error: null,
          searchQuery: '',
        },
        filters: {
          mode: 'all',
          gender: 'any',
          city: [],
          skill: [],
          ...initialFilters,
        } as FiltersState,
      },
    });
  };

  test('Должен отображать компонент с заголовком', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <FiltersPanel skillsCategories={mockSkillsCategories} cities={mockCities} />
      </Provider>,
    );
    expect(screen.getByText('Фильтры')).toBeInTheDocument();
  });

  test('Должен отображать выпадающие списки для навыков и городов', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <FiltersPanel skillsCategories={mockSkillsCategories} cities={mockCities} />
      </Provider>,
    );
    expect(screen.getByText('Навыки')).toBeInTheDocument();
    expect(screen.getByText('Город')).toBeInTheDocument();
  });

  test('Должен переключать режим на "Могу научить"', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <FiltersPanel skillsCategories={mockSkillsCategories} cities={mockCities} />
      </Provider>,
    );
    const canTeachRadio = screen.getByLabelText('Могу научить');
    fireEvent.click(canTeachRadio);
    expect(store.getState().filters.mode).toBe('can-teach');
  });

  test('Должен переключать режим на "Хочу научиться"', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <FiltersPanel skillsCategories={mockSkillsCategories} cities={mockCities} />
      </Provider>,
    );
    const wantToLearnRadio = screen.getByLabelText('Хочу научиться');
    fireEvent.click(wantToLearnRadio);
    expect(store.getState().filters.mode).toBe('want-to-learn');
  });

  test('Должен фильтровать по полу (мужской)', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <FiltersPanel skillsCategories={mockSkillsCategories} cities={mockCities} />
      </Provider>,
    );
    const maleRadio = screen.getByLabelText('Мужской');
    fireEvent.click(maleRadio);
    expect(store.getState().filters.gender).toBe('male');
  });

  test('Должен фильтровать по полу (женский)', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <FiltersPanel skillsCategories={mockSkillsCategories} cities={mockCities} />
      </Provider>,
    );
    const femaleRadio = screen.getByLabelText('Женский');
    fireEvent.click(femaleRadio);
    expect(store.getState().filters.gender).toBe('female');
  });

  test('Должен обновлять фильтр города при клике', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <FiltersPanel skillsCategories={mockSkillsCategories} cities={mockCities} />
      </Provider>,
    );
    const cityCheckbox = screen.getByLabelText('Москва');
    fireEvent.click(cityCheckbox);
    expect(store.getState().filters.city).toContain('Москва');
  });

  test('Должен обновлять фильтр навыков при клике', async () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <FiltersPanel skillsCategories={mockSkillsCategories} cities={mockCities} />
      </Provider>,
    );
    fireEvent.click(screen.getByText('Навыки'));
    const categoryButton = screen.getByText('Бизнес и карьера');
    fireEvent.click(categoryButton);
    const skillCheckbox = screen.getByLabelText('Маркетинг и реклама');
    fireEvent.click(skillCheckbox);
    expect(store.getState().filters.skill).toContain('Маркетинг и реклама');
  });

  test('Должен отображать кнопку сброса при активных фильтрах', () => {
    const store = createStore({ city: ['Москва'] });
    render(
      <Provider store={store}>
        <FiltersPanel skillsCategories={mockSkillsCategories} cities={mockCities} />
      </Provider>,
    );
    expect(screen.getByText('Сбросить')).toBeInTheDocument();
  });

  test('Должен сбрасывать все фильтры при клике на кнопку', () => {
    const store = createStore({ city: ['Москва'], skill: ['Маркетинг и реклама'] });
    render(
      <Provider store={store}>
        <FiltersPanel skillsCategories={mockSkillsCategories} cities={mockCities} />
      </Provider>,
    );
    fireEvent.click(screen.getByText('Сбросить'));
    const { filters } = store.getState();
    expect(filters.city).toEqual([]);
    expect(filters.skill).toEqual([]);
    expect(filters.mode).toBe('all');
    expect(filters.gender).toBe('any');
  });

  test('Должен сбрасывать поисковый запрос при сбросе фильтров', () => {
    const customStore = configureStore({
      reducer: {
        filters: filtersReducer as Reducer<FiltersState>,
        catalog: catalogReducer,
      },
      preloadedState: {
        catalog: {
          users: [],
          loading: false,
          error: null,
          searchQuery: 'тест',
        },
        filters: {
          mode: 'can-teach',
          gender: 'male',
          city: ['Москва'],
          skill: ['Маркетинг и реклама'],
        } as FiltersState,
      },
    });
    render(
      <Provider store={customStore}>
        <FiltersPanel skillsCategories={mockSkillsCategories} cities={mockCities} />
      </Provider>,
    );
    fireEvent.click(screen.getByText('Сбросить'));
    expect(customStore.getState().catalog.searchQuery).toBe('');
  });

  test('Должен отображать количество активных фильтров', () => {
    const store = createStore({ city: ['Москва'], skill: ['Английский'] });
    render(
      <Provider store={store}>
        <FiltersPanel skillsCategories={mockSkillsCategories} cities={mockCities} />
      </Provider>,
    );
    expect(screen.getByText('Фильтры (2)')).toBeInTheDocument();
  });

  test('Должен корректно считать активные фильтры (все варианты)', () => {
    const store = createStore({
      mode: 'can-teach',
      gender: 'male',
      city: ['Москва'],
      skill: ['Маркетинг и реклама'],
    });
    render(
      <Provider store={store}>
        <FiltersPanel skillsCategories={mockSkillsCategories} cities={mockCities} />
      </Provider>,
    );
    expect(screen.getByText('Фильтры (4)')).toBeInTheDocument();
  });

  test('Не должен показывать счетчик фильтров при их отсутствии', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <FiltersPanel skillsCategories={mockSkillsCategories} cities={mockCities} />
      </Provider>,
    );
    expect(screen.queryByText(/Фильтры \(\d+\)/)).not.toBeInTheDocument();
    expect(screen.getByText('Фильтры')).toBeInTheDocument();
  });

  test('Должен работать с пустыми списками городов и навыков', () => {
    const store = createStore();
    const emptySkills = {};
    const emptyCities = {};
    render(
      <Provider store={store}>
        <FiltersPanel skillsCategories={emptySkills} cities={emptyCities} />
      </Provider>,
    );
    expect(screen.getByText('Навыки')).toBeInTheDocument();
    expect(screen.getByText('Город')).toBeInTheDocument();
  });
});
