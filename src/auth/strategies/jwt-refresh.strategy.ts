/**
 * Модуль для стратегии RefreshAuthGuard, для проверки авторизации по refresh токену
 */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigType } from '@nestjs/config';

import { JwtPayload } from '../types/types';
import { jwtConfig } from '../../config/jwt.config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigType<typeof jwtConfig>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.refreshSecret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const headerAuthorization = req.get('authorization');
    const tokenRefresh = headerAuthorization?.replace('Bearer ', '').trim();

    return {
      user: payload.sub,
      tokenRefresh,
    };
  }
}
