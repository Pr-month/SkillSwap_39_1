/**
 * Модуль для гарды RefreshAuthGuard, для проверки авторизации по refresh токену
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('refresh') {}
