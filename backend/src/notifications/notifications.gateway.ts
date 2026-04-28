import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../auth/guards/ws-jwt-guard';
import { NotificationPayloadDto } from './dto/notification-payload.dto';
import { JwtPayload } from '../auth/types/types';

interface SocketWithUser extends Socket {
  data: {
    user?: JwtPayload;
    userId?: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private wsJwtGuard: WsJwtGuard) {}

  async handleConnection(client: SocketWithUser) {
    try {
      const user = await this.wsJwtGuard.validateToken(client);
      const userId = user.sub;

      if (!userId) {
        console.log(
          `Пользователь ${client.id} не подключен: Не найден id пользователя`,
        );
        client.disconnect();
        return;
      }

      client.data.user = user;
      client.data.userId = userId;

      await client.join(userId);

      console.log(`Пользователь ${userId} подключен к комнате`);
      client.emit('connected', { message: 'Подключен к серверу уведомлений' });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.log(
        `Ошибка соединения пользователя ${client.id}: ${errorMessage}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: SocketWithUser) {
    const userId = client.data.userId;
    if (userId) {
      console.log(`Пользователь ${userId} был отключен от уведомлений`);
    }
  }

  @SubscribeMessage('connectToNotifications')
  handleConnect(client: SocketWithUser) {
    const userId = client.data.user?.sub;
    if (userId) {
      void client.join(userId);
    }
  }

  notifyUser(userId: string, payload: NotificationPayloadDto) {
    this.server.to(userId).emit('notificateNewRequest', {
      ...payload,
      message: this.getNotificationMessage(payload),
    });
  }

  private getNotificationMessage(payload: NotificationPayloadDto): string {
    switch (payload.type) {
      case 'new_request':
        return `Вам направили заявку на навык ${payload.skillTitle} от ${payload.fromUser.name}`;
      case 'request_accepted':
        return `Ваша заявка на навык "${payload.skillTitle}" принял пользователь ${payload.fromUser.name}`;
      case 'request_rejected':
        return `Ваша заявка на навык "${payload.skillTitle}" отклонил пользователь ${payload.fromUser.name}`;
      default:
        return 'Уведомляем вас, что вы чудо!';
    }
  }
}
