import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { jwtConfig, TJwtConfig } from '../../config/jwt.config';
import { JwtPayload } from '../types/types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtSettings: TJwtConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSettings.refreshSecret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const authHeader = req.get('authorization');

    if (!authHeader) {
      throw new UnauthorizedException('Refresh token не найден');
    }

    const refreshToken = authHeader.replace('Bearer', '').trim();

    return {
      ...payload,
      refreshToken,
    };
  }
}
