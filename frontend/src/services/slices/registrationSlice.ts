import { registerUserApi, extractApiErrorMessage } from '@/api/skillSwapApi';
import { RegisterDto, RegistrationGender } from '@/entities/auth/model/types';
import { SkillCategory, SkillSubcategory } from '@/entities/skill/model/types';
import { russianCities } from '@/shared/lib/cities';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchUser } from '../thunk/authUser';
import { setCookie } from '@/shared/utils/cookies';

type City = (typeof russianCities)[number];

export type TFullRegistrationData = TStepOneData &
  TStepTwoData &
  Partial<TStepThreeData>;

export type TStepOneData = {
  email: RegisterDto['email'] | undefined;
  password: RegisterDto['password'] | undefined;
};

export type TStepTwoData = {
  avatar: RegisterDto['avatar'] | undefined;
  name: RegisterDto['name'] | undefined;
  birthdate: RegisterDto['birthdate'] | undefined;
  gender: RegistrationGender | undefined;
  city: City | undefined;
  about: RegisterDto['about'] | undefined;
  categoryId: RegisterDto['categoryId'] | undefined;
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
    about: undefined,
    categoryId: undefined,
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

export const registerUser = createAsyncThunk<
  void,
  TFullRegistrationData,
  { rejectValue: string }
>(
  'registration/submit',
  async (data, { dispatch, rejectWithValue }) => {
    if (
      !data.email ||
      !data.password ||
      !data.name ||
      !data.birthdate ||
      !data.categoryId
    ) {
      return rejectWithValue('Форма регистрации заполнена не полностью');
    }

    try {
      const tokens = await registerUserApi({
        email: data.email,
        password: data.password,
        name: data.name,
        birthdate: data.birthdate,
        city: data.city,
        gender: data.gender,
        about: data.about,
        avatar: data.avatar,
        categoryId: data.categoryId,
      } satisfies RegisterDto);

      setCookie('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      await dispatch(fetchUser()).unwrap();
    } catch (error) {
      return rejectWithValue(
        extractApiErrorMessage(error, 'Не удалось завершить регистрацию'),
      );
    }
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
        state.error = undefined;
      })
      .addCase(registerUser.fulfilled, () => {
        return initialState;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error.message || 'Не удалось завершить регистрацию';
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
