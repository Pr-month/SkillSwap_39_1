/**
 * Модуль для типов авторизации
 */
import { Request } from 'express';
import { Role } from '../../common/enums/role.enum';

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};

export type AuthRequest = Request & {
  user: JwtPayload;
};
