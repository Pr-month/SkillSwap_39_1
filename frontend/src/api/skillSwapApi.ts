import {
  RegisterDto,
  RegistrationGender,
} from '@/entities/auth/model/types';
import { Category } from '@/entities/category/model/types';
import { CustomSkill, Skill } from '@/entities/skill/model/types';
import { ExchangeRequest, User } from '@/entities/user/model/types';
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

type BackendCategory = {
  id: string;
  name: string;
  parentId: string | null;
  parent?: BackendCategory | null;
};

type BackendUserSkill = {
  id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  category: BackendCategory | null;
};

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
  skills?: BackendUserSkill[];
  wantToLearn?: BackendCategory[];
};

type BackendRequestUser = {
  id: string;
  name: string;
};

type BackendRequestSkill = {
  id: string;
  title: string;
};

type BackendExchangeRequest = {
  id: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  status: ExchangeRequest['status'];
  isRead: boolean;
  offeredSkillId?: string | null;
  requestedSkillId?: string | null;
  sender?: BackendRequestUser;
  receiver?: BackendRequestUser;
  offeredSkill?: BackendRequestSkill | null;
  requestedSkill?: BackendRequestSkill | null;
};

type UsersResponseMeta = {
  page: number;
  limit: number;
  skip: number;
  take: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type UsersResponse = {
  data: BackendUser[];
  meta: UsersResponseMeta;
};

type RequestsResponse = {
  data: BackendExchangeRequest[];
};

type CreateExchangeRequestPayload = {
  offeredSkillId: string;
  requestedSkillId: string;
};

type SkillMutationPayload = {
  title: string;
  description?: string;
  images?: string[];
  categoryId: string;
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

const isNotFoundApiError = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const apiError = error as ApiErrorResponse;
  return apiError.statusCode === 404;
};

const getAccessToken = () => {
  const accessToken = getCookie('accessToken');

  if (!accessToken) {
    throw new Error('Токен доступа отсутствует');
  }

  return accessToken;
};

const mapCategoryToSkillCategory = (category?: BackendCategory | null) => {
  if (!category) {
    return {
      category: '',
      subcategory: '',
      subcategoryId: '',
    };
  }

  if (category.parent?.name) {
    return {
      category: category.parent.name,
      subcategory: category.name,
      subcategoryId: category.id,
    };
  }

  return {
    category: category.name,
    subcategory: category.name,
    subcategoryId: category.id,
  };
};

const adaptBackendSkillToCustomSkill = (
  skill?: BackendUserSkill,
): CustomSkill => {
  if (!skill) {
    return createEmptySkill();
  }

  const categoryInfo = mapCategoryToSkillCategory(skill.category);

  return {
    ...categoryInfo,
    name: skill.title,
    image: skill.images || [],
    description: skill.description || '',
    customSkillId: skill.id,
  } as CustomSkill;
};

const adaptBackendWantToLearn = (category: BackendCategory) => {
  const categoryInfo = mapCategoryToSkillCategory(category);

  return {
    ...categoryInfo,
    name: categoryInfo.subcategory || categoryInfo.category,
    customSkillId: category.id,
  } as Omit<CustomSkill, 'description' | 'image'>;
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
  canTeach: adaptBackendSkillToCustomSkill(backendUser.skills?.[0]),
  wantsToLearn: (backendUser.wantToLearn || []).map(adaptBackendWantToLearn),
  email: backendUser.email,
});

const adaptBackendRequestToExchangeRequest = (
  request: BackendExchangeRequest,
): ExchangeRequest => ({
  id: request.id,
  fromUserId: request.senderId,
  fromUserName: request.sender?.name || 'Пользователь',
  toUserId: request.receiverId,
  toUserName: request.receiver?.name,
  offeredSkillId: request.offeredSkillId ?? null,
  offeredSkillName: request.offeredSkill?.title,
  requestedSkillId: request.requestedSkillId ?? null,
  requestedSkillName: request.requestedSkill?.title,
  status: request.status,
  isRead: request.isRead,
  createdAt: request.createdAt,
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

export const createSkillApi = async (
  data: SkillMutationPayload,
): Promise<void> => {
  const res = await fetch('/api/skills', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(data),
  });

  await checkResponse<BackendUserSkill>(res);
};

export const updateSkillApi = async (
  skillId: string,
  data: Partial<SkillMutationPayload>,
): Promise<void> => {
  const res = await fetch(`/api/skills/${skillId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(data),
  });

  await checkResponse<BackendUserSkill>(res);
};

export const getCategoriesApi = async (): Promise<Category[]> => {
  const res = await fetch('/api/categories');
  return checkResponse<Category[]>(res);
};

export const getUsersApi = async () => {
  const limit = 50;
  let page = 1;
  let hasNext = true;
  const users: User[] = [];

  while (hasNext) {
    const res = await fetch(`/api/users?limit=${limit}&page=${page}`);
    const payload = await checkResponse<UsersResponse>(res);

    users.push(...payload.data.map(adaptBackendUserToUser));
    hasNext = payload.meta.hasNext;
    page += 1;
  }

  return users;
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

const getRequestsApi = async (
  endpoint: '/api/requests/incoming' | '/api/requests/outgoing',
): Promise<ExchangeRequest[]> => {
  try {
    const res = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    const payload = await checkResponse<RequestsResponse>(res);

    return payload.data.map(adaptBackendRequestToExchangeRequest);
  } catch (error) {
    if (isNotFoundApiError(error)) {
      return [];
    }

    throw error;
  }
};

export const getIncomingRequestsApi = () => getRequestsApi('/api/requests/incoming');

export const getOutgoingRequestsApi = () => getRequestsApi('/api/requests/outgoing');

export const createExchangeRequestApi = async (
  data: CreateExchangeRequestPayload,
): Promise<void> => {
  const res = await fetch('/api/requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(data),
  });

  await checkResponse<BackendExchangeRequest>(res);
};

export const markRequestAsReadApi = async (id: string): Promise<void> => {
  const res = await fetch(`/api/requests/${id}/read`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  await checkResponse<BackendExchangeRequest>(res);
};

export const markAllRequestsAsReadApi = async (): Promise<void> => {
  const res = await fetch('/api/requests/read-all', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  await checkResponse<{ message: string }>(res);
};

export const getCurrentUserApi = async (): Promise<User> => {
  const res = await fetch('/api/users/me', {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
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
  name?: string;
  birthdate?: string;
  gender?: RegistrationGender;
  city?: string;
  about?: string;
  avatar?: string;
  categoryId?: string;
};

export const updateProfileApi = async (data: TUpdateProfileData): Promise<User> => {
  const res = await fetch(`${URL}/api/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Bearer ${getCookie('accessToken') || ''}`,
    },
    body: JSON.stringify(data),
  });

  const backendUser = await checkResponse<BackendUser>(res);
  return adaptBackendUserToUser(backendUser);
};

export type ServerResponse<T> = {
  success: boolean;
  data: T;
};
