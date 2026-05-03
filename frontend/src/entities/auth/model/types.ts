export const enum RequestStatus {
  Idle = 'Idle',
  Loading = 'Loading',
  Success = 'Success',
  Failed = 'Failed',
}

export type RegistrationGender = 'male' | 'female' | 'unknown';

export type RegisterDto = {
  email: string;
  password: string;
  name: string;
  birthdate: string;
  city?: string;
  gender?: RegistrationGender;
  about?: string;
  avatar?: string;
  categoryId: string;
};
