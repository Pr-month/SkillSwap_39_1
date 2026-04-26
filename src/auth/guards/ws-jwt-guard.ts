import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { jwtConfig, TJwtConfig } from '../../config/jwt.config';
import { JwtPayload } from '../types/types';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtSettings: TJwtConfig,
  ) {}

  async validateToken(client: Socket): Promise<JwtPayload> {
    const token = client.handshake.query?.token as string;
    if (!token) {
      throw new WsException('Token not provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.jwtSettings.secret,
      });

      return payload;
    } catch {
      throw new WsException('Invalid token');
    }
  }
}
