import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { WsJwtGuard } from '../auth/guards/ws-jwt-guard';

@Module({
  providers: [NotificationsGateway, NotificationsService, WsJwtGuard],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
