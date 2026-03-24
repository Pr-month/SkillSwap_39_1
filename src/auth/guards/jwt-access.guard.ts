/**
 * Модуль для гарды JwtAuthGuard, для проверки авторизации по access токену
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
