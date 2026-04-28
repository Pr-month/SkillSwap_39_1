import stepsSlice, { stepActions, stepSelectors } from '../stepSlice';

describe('stepSlice', () => {
  const getInitialState = () => ({ currentStep: 0, totalSteps: 0 });

  describe('reducers', () => {
    test('initializeSteps устанавливает totalSteps и сбрасывает currentStep', () => {
      const state = getInitialState();
      const nextState = stepsSlice.reducer(state, stepActions.initializeSteps(5));

      expect(nextState.totalSteps).toBe(5);
      expect(nextState.currentStep).toBe(0);
    });

    test('nextStep увеличивает currentStep, если не достигнут предел', () => {
      const state = { currentStep: 1, totalSteps: 3 };
      const nextState = stepsSlice.reducer(state, stepActions.nextStep());

      expect(nextState.currentStep).toBe(2);
    });

    test('nextStep не увеличивает currentStep, если достигнут предел', () => {
      const state = { currentStep: 2, totalSteps: 3 };
      const nextState = stepsSlice.reducer(state, stepActions.nextStep());

      expect(nextState.currentStep).toBe(2);
    });

    test('prevStep уменьшает currentStep, если больше 0', () => {
      const state = { currentStep: 2, totalSteps: 3 };
      const nextState = stepsSlice.reducer(state, stepActions.prevStep());

      expect(nextState.currentStep).toBe(1);
    });

    test('prevStep не уменьшает currentStep, если он 0', () => {
      const state = { currentStep: 0, totalSteps: 3 };
      const nextState = stepsSlice.reducer(state, stepActions.prevStep());

      expect(nextState.currentStep).toBe(0);
    });

    test('goToStep устанавливает currentStep в допустимых границах', () => {
      const state = { currentStep: 0, totalSteps: 4 };
      const nextState = stepsSlice.reducer(state, stepActions.goToStep(2));

      expect(nextState.currentStep).toBe(2);
    });

    test('goToStep не меняет currentStep, если шаг вне границ', () => {
      const state = { currentStep: 1, totalSteps: 3 };
      const nextState = stepsSlice.reducer(state, stepActions.goToStep(5));

      expect(nextState.currentStep).toBe(1);
    });

    test('resetSteps сбрасывает состояние к начальному', () => {
      const state = { currentStep: 2, totalSteps: 5 };
      const nextState = stepsSlice.reducer(state, stepActions.resetSteps());

      expect(nextState).toEqual(getInitialState());
    });
  });

  describe('selectors', () => {
    const state = { step: { currentStep: 3, totalSteps: 7 } };

    test('currentStep возвращает текущий шаг', () => {
      expect(stepSelectors.currentStep(state)).toBe(3);
    });

    test('totalSteps возвращает общее количество шагов', () => {
      expect(stepSelectors.totalSteps(state)).toBe(7);
    });
  });
});
