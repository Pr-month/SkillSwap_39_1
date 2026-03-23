/**
 * Модуль для типов авторизации
 */
import { Request } from 'express';

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

export type AuthRequest = Request & {
  user: JwtPayload;
};
