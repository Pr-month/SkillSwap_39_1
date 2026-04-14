import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard {
    constructor(private jwtService: JwtService,
                private configService: ConfigService,
    ) {}

    async validateToken(client: Socket): Promise<boolean> {
        const token = client.handshake.query?.token as string;
        if (!token) {
            throw new WsException('Token not provided');
        }
        
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            });

            client.data.user = payload;
            return true;
        } catch (error) {
            throw new WsException('Invalid token');
        }
    }
}