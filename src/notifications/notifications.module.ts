import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { JwtModule } from '@nestjs/jwt';
import { WsJwtGuard } from './ws-jwt-guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [NotificationsGateway, NotificationsService, WsJwtGuard],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
