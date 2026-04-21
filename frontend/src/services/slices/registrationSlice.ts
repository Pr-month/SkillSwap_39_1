import { SkillCategory, SkillSubcategory } from '@/entities/skill/model/types';
import { russianCities } from '@/shared/lib/cities';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
type City = (typeof russianCities)[number];

export type TFullRegistrationData = TStepOneData & TStepTwoData & TStepThreeData;

export type TStepOneData = {
  email: string | undefined;
  password: string | undefined;
};

export type TStepTwoData = {
  avatar: string | undefined;
  name: string | undefined;
  birthdate: string | undefined;
  gender: 'Мужской' | 'Женский' | undefined;
  city: City | undefined;
  categories: SkillCategory[] | undefined;
  subcategories: SkillSubcategory<SkillCategory>[] | undefined;
};

export type TStepThreeData = {
  skillName: string | undefined;
  skillCategory: SkillCategory | undefined;
  skillSubCategory: SkillSubcategory<SkillCategory> | undefined;
  description: string | undefined;
  images: string[] | undefined;
  customSkillId: string | undefined;
  subcategoryId: string | undefined;
  userId: string | undefined;
};

type RegistrationState = {
  stepOneData: TStepOneData;
  stepTwoData: TStepTwoData;
  stepThreeData: TStepThreeData;
  error: string | undefined;
  loading: boolean;
};

const initialState: RegistrationState = {
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

export const registerUser = createAsyncThunk(
  'registration/submit',
  async (data: TFullRegistrationData) => {
    localStorage.setItem('registrationData', JSON.stringify(data));
  },
);

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  selectors: {
    getAllRegistrationInfo: state => ({
      data: [state.stepOneData, state.stepTwoData, state.stepThreeData],
    }),
    getStepThreeData: state => state.stepThreeData,
  },
  reducers: {
    updateStepOneData: (
      state,
      action: PayloadAction<Partial<RegistrationState['stepOneData']>>,
    ) => {
      state.stepOneData = { ...state.stepOneData, ...action.payload };
    },
    updateStepTwoData: (
      state,
      action: PayloadAction<Partial<RegistrationState['stepTwoData']>>,
    ) => {
      state.stepTwoData = { ...state.stepTwoData, ...action.payload };
    },
    updateStepThreeData: (
      state,
      action: PayloadAction<Partial<RegistrationState['stepThreeData']>>,
    ) => {
      state.stepThreeData = { ...state.stepThreeData, ...action.payload };
    },
    resetStepOneData: state => {
      state.stepOneData = initialState.stepOneData;
    },
    resetStepTwoData: state => {
      state.stepTwoData = initialState.stepTwoData;
    },
    resetStepThreeData: state => {
      state.stepThreeData = initialState.stepThreeData;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(registerUser.pending, state => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, () => {
        return initialState;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const {
  updateStepOneData,
  updateStepTwoData,
  updateStepThreeData,
  resetStepOneData,
  resetStepTwoData,
  resetStepThreeData,
} = registrationSlice.actions;

export const registrationReducer = registrationSlice.reducer;
export const registrationSelectors = registrationSlice.selectors;
