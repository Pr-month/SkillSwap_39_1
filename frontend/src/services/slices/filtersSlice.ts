import { createSlice, PayloadAction, Draft } from '@reduxjs/toolkit';
import { ExperienceOption, GenderOption } from '@/entities/user/model/types';

interface FiltersState {
  mode: ExperienceOption['value'];
  gender: GenderOption['value'];
  city: string[];
  skill: string[];
}

const initialState: FiltersState = {
  mode: 'all',
  gender: 'any',
  city: [],
  skill: [],
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setMode: (state: Draft<FiltersState>, action: PayloadAction<FiltersState['mode']>) => {
      state.mode = action.payload;
    },
    setGender: (state: Draft<FiltersState>, action: PayloadAction<FiltersState['gender']>) => {
      state.gender = action.payload;
    },
    setCities: (state: Draft<FiltersState>, action: PayloadAction<string[]>) => {
      state.city = action.payload;
    },
    setSkills: (state: Draft<FiltersState>, action: PayloadAction<string[]>) => {
      state.skill = action.payload;
    },
    removeFilter: (
      state: Draft<FiltersState>,
      action: PayloadAction<{
        type: keyof FiltersState;
        value?: string;
      }>,
    ) => {
      const { type, value } = action.payload;

      switch (type) {
        case 'mode':
          state.mode = 'all';
          break;
        case 'gender':
          state.gender = 'any';
          break;
        case 'city':
          if (value) {
            state.city = state.city.filter(c => c !== value);
          }
          break;
        case 'skill':
          if (value) {
            state.skill = state.skill.filter(s => s !== value);
          }
          break;
        default: {
          const _exhaustiveCheck: never = type;
          return _exhaustiveCheck;
        }
      }
    },
    resetFilters: () => initialState,
  },
});

export const { setMode, setGender, setCities, setSkills, removeFilter, resetFilters } =
  filtersSlice.actions;

export default filtersSlice.reducer;
