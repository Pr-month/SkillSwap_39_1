import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { WsJwtGuard } from '../auth/guards/ws-jwt-guard';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [NotificationsGateway, NotificationsService, WsJwtGuard, JwtService],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
