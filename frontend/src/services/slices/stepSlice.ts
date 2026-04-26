import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { STEP_SLICE_NAME } from './slicesName';

interface StepsState {
  currentStep: number;
  totalSteps: number;
}

const initialState: StepsState = {
  currentStep: 0,
  totalSteps: 0,
};

const stepsSlice = createSlice({
  name: STEP_SLICE_NAME,
  initialState,
  reducers: {
    initializeSteps: (state, action: PayloadAction<number>) => {
      state.totalSteps = action.payload;
      state.currentStep = 0;
    },

    nextStep: state => {
      if (state.currentStep < state.totalSteps - 1) {
        state.currentStep += 1;
      }
    },
    prevStep: state => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    goToStep: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.totalSteps) {
        state.currentStep = action.payload;
      }
    },
    resetSteps: () => initialState,
  },
  selectors: {
    currentStep: state => state.currentStep,
    totalSteps: state => state.totalSteps,
  },
});

export const stepSelectors = stepsSlice.selectors;
export const stepActions = stepsSlice.actions;
export default stepsSlice;
