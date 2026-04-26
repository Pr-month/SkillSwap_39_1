import { describe, it, expect, beforeEach } from 'vitest';
import {
  registrationReducer,
  updateStepOneData,
  updateStepTwoData,
  updateStepThreeData,
  resetStepOneData,
  resetStepTwoData,
  resetStepThreeData,
  registerUser,
} from '../registrationSlice';

const initialState = {
  stepOneData: {
    email: undefined,
    password: undefined,
  },
  stepTwoData: {
    name: undefined,
    birthdate: undefined,
    gender: undefined,
    city: undefined,
    categories: undefined,
    subcategories: undefined,
    avatar: undefined,
  },
  stepThreeData: {
    skillName: undefined,
    skillCategory: undefined,
    description: undefined,
    images: undefined,
    customSkillId: undefined,
    subcategoryId: undefined,
    skillSubCategory: undefined,
    userId: undefined,
  },
  error: undefined,
  loading: false,
};
describe('тест слайса registrationSlice', () => {
  let state: typeof initialState;

  beforeEach(() => {
    state = { ...initialState };
  });

  it('проверка обновления данных первого шага регистрации', () => {
    const action = updateStepOneData({ email: 'test@mail.com' });
    const newState = registrationReducer(state, action);
    expect(newState.stepOneData.email).toBe('test@mail.com');
  });

  it('проверка обновления данных второго шага регистрации', () => {
    const action = updateStepTwoData({ name: 'Иван', gender: 'Мужской' });
    const newState = registrationReducer(state, action);
    expect(newState.stepTwoData.name).toBe('Иван');
    expect(newState.stepTwoData.gender).toBe('Мужской');
  });

  it('проверка обновления данных третьего шага регистрации', () => {
    const action = updateStepThreeData({ skillName: 'Игнорирование дедлайнов' });
    const newState = registrationReducer(state, action);
    expect(newState.stepThreeData.skillName).toBe('Игнорирование дедлайнов');
  });

  it('проверка сброса данных первого шага регистрации', () => {
    const populatedState = registrationReducer(
      state,
      updateStepOneData({ email: 'test@mail.com' }),
    );
    const newState = registrationReducer(populatedState, resetStepOneData());
    expect(newState.stepOneData).toEqual(initialState.stepOneData);
  });

  it('проверка сброса данных второго шага регистрации', () => {
    const populatedState = registrationReducer(state, updateStepTwoData({ name: 'Васян' }));
    const newState = registrationReducer(populatedState, resetStepTwoData());
    expect(newState.stepTwoData).toEqual(initialState.stepTwoData);
  });

  it('проверка сброса данных третьего шага регистрации', () => {
    const populatedState = registrationReducer(
      state,
      updateStepThreeData({ skillName: 'Пренебрежение коммуникацией' }),
    );
    const newState = registrationReducer(populatedState, resetStepThreeData());
    expect(newState.stepThreeData).toEqual(initialState.stepThreeData);
  });

  describe('проверка редьюсера registerUser', () => {
    it('обрабатывает pending', () => {
      const newState = registrationReducer(state, { type: registerUser.pending.type });
      expect(newState.loading).toBe(true);
    });

    it('обрабатывает fulfilled и сбрасывает состояние', () => {
      const populatedState = {
        ...state,
        stepOneData: { email: 'test@mail.com', password: '123' },
      };
      const newState = registrationReducer(populatedState, {
        type: registerUser.fulfilled.type,
      });
      expect(newState).toEqual(initialState);
    });

    it('обрабатывает rejected и устанавливает ошибку', () => {
      const errorMessage = 'Сегодня не зарегистрируешься :c';
      const newState = registrationReducer(state, {
        type: registerUser.rejected.type,
        error: { message: errorMessage },
      });
      expect(newState.error).toBe(errorMessage);
    });
  });
});
