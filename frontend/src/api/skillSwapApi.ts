import {
  RegisterDto,
  RegistrationGender,
} from '@/entities/auth/model/types';
import { Category } from '@/entities/category/model/types';
import { Skill } from '@/entities/skill/model/types';
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
type AuthResponse = ServerResponse<{ accessToken: string; refreshToken: string }>;
type UploadFileResponse = {
  message: string;
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
};

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

export const loginUserApi = async (data: LoginData) => {
  const res = await fetch(`/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(data),
  });
  const checkedRes = await checkResponse<AuthResponse>(res);
  return assertSuccess(checkedRes, 'Не удалось залогиниться');
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
  return fetch(`${URL}/api/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      authorization: getCookie('accessToken') || '',
    },
    body: JSON.stringify(data),
  }).then(res => checkResponse<TUpdateProfileResponse>(res));
};

export type ServerResponse<T> = {
  success: boolean;
  data: T;
};
