import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { jwtConfig, TJwtConfig } from '../../config/jwt.config';
import { JwtPayload } from '../types/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly config: TJwtConfig,
  ) {
    // В mixin типе PassportStrategy вызов super воспринимается линтером как небезопасный
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      jwtFromRequest: (request: Request) => {
        const authorizationHeader = request.headers.authorization;

        if (!authorizationHeader?.startsWith('Bearer ')) {
          return null;
        }

        return authorizationHeader.slice('Bearer '.length);
      },
      ignoreExpiration: false,
      secretOrKey: config.secret,
    });
  }

  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
