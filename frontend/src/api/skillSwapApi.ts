import {
  RegisterDto,
  RegistrationGender,
} from '@/entities/auth/model/types';
import { Category } from '@/entities/category/model/types';
import { CustomSkill, Skill } from '@/entities/skill/model/types';
import { User } from '@/entities/user/model/types';
import { TServerResponse } from '@/shared/utils/api';
import { getCookie } from '@/shared/utils/cookies';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const URL = API_BASE_URL ? `${API_BASE_URL}` : '';
const PUBLIC_API_URL = API_BASE_URL || 'http://localhost:3000';

const checkResponse = <T>(res: Response): Promise<T> =>
  res.ok ? res.json() : res.json().then(err => Promise.reject(err));

const assertSuccess = <T>(response: { success?: boolean; data: T }, errorText: string) => {
  if (response.success === false) throw new Error(errorText);
  return response.data;
};

type SkillResponse = ServerResponse<Skill[]> | { data: Skill[] };

type UsersResponse = ServerResponse<User[]> | { data: User[] };
type BackendUser = {
  id: string;
  name: string;
  email: string;
  about: string | null;
  birthdate: string | null;
  city: string | null;
  gender: RegistrationGender | null;
  avatar: string | null;
  role: string;
};
type UploadFileResponse = {
  message: string;
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
};
type LogoutResponse = {
  message: string;
};
type ApiErrorResponse = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

const createEmptySkill = (): CustomSkill =>
  ({
    category: '',
    subcategory: '',
    subcategoryId: '',
    name: '',
    image: [],
    description: '',
    customSkillId: '',
  }) as unknown as CustomSkill;

export const extractApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
) => {
  if (!error || typeof error !== 'object') {
    return fallbackMessage;
  }

  const apiError = error as ApiErrorResponse;

  if (Array.isArray(apiError.message)) {
    return apiError.message.join(', ');
  }

  if (typeof apiError.message === 'string' && apiError.message.trim()) {
    return apiError.message;
  }

  if (typeof apiError.error === 'string' && apiError.error.trim()) {
    return apiError.error;
  }

  return fallbackMessage;
};

const adaptBackendUserToUser = (backendUser: BackendUser): User => ({
  _id: backendUser.id,
  name: backendUser.name,
  image: backendUser.avatar || '',
  city: backendUser.city || '',
  gender: backendUser.gender || 'unknown',
  birthdayDate: backendUser.birthdate || '',
  description: backendUser.about || '',
  likes: [],
  createdAt: '',
  canTeach: createEmptySkill(),
  wantsToLearn: [],
  email: backendUser.email,
});

const resolvePublicFileUrl = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return `${PUBLIC_API_URL}${normalizedPath}`;
};

export const getSkillsApi = async () => {
  const res = await fetch(`/api/skills`);
  const checkedRes = await checkResponse<SkillResponse>(res);
  return assertSuccess(checkedRes, 'Не удалось получить навыки');
};

export const getCategoriesApi = async (): Promise<Category[]> => {
  const res = await fetch('/api/categories');
  return checkResponse<Category[]>(res);
};

export const getUsersApi = async () => {
  const res = await fetch(`/api/users/all`);
  const checkedRes = await checkResponse<UsersResponse>(res);
  return assertSuccess(checkedRes, 'Не удалось получить данные о пользователях');
};

export type LoginData = {
  email: string;
  password: string;
};

export type RegistrationPayload = RegisterDto;
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export const registerUserApi = async (
  data: RegistrationPayload,
): Promise<AuthTokens> => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(data),
  });
  return checkResponse<AuthTokens>(res);
};

export const loginUserApi = async (data: LoginData): Promise<AuthTokens> => {
  const res = await fetch(`/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(data),
  });
  return checkResponse<AuthTokens>(res);
};

export const getCurrentUserApi = async (): Promise<User> => {
  const accessToken = getCookie('accessToken');

  if (!accessToken) {
    throw new Error('Токен доступа отсутствует');
  }

  const res = await fetch('/api/users/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const backendUser = await checkResponse<BackendUser>(res);
  return adaptBackendUserToUser(backendUser);
};

export const logoutUserApi = async (): Promise<LogoutResponse> => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    return { message: 'Токен обновления отсутствует' };
  }

  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  return checkResponse<LogoutResponse>(res);
};

export const uploadFileApi = async (file: File): Promise<UploadFileResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/files/upload', {
    method: 'POST',
    body: formData,
  });

  const uploadedFile = await checkResponse<UploadFileResponse>(res);

  return {
    ...uploadedFile,
    url: resolvePublicFileUrl(uploadedFile.url),
  };
};

// Добавляем тип для обновления профиля
export type TUpdateProfileData = {
  name: string;
  birthdate: string;
  gender: RegistrationGender;
  city: string;
  description: string;
  avatar?: string;
};

export type TUpdateProfileResponse = TServerResponse<{
  user: User;
}>;

// Добавляем метод для обновления профиля
export const updateProfileApi = (data: TUpdateProfileData): Promise<TUpdateProfileResponse> => {
  return fetch(`${URL}/api/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Bearer ${getCookie('accessToken') || ''}`,
    },
    body: JSON.stringify(data),
  }).then(res => checkResponse<TUpdateProfileResponse>(res));
};

export type ServerResponse<T> = {
  success: boolean;
  data: T;
};
