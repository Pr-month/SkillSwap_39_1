import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client: Socket = context.switchToWs().getClient();
        
        const token = client.handshake.query?.token as string;
        if (!token) {
            throw new UnauthorizedException('Token not provided');
        }
        
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_ACCESS_SECRET || 'top-secret-key-JWT',
            });

            client.data.user = payload;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}