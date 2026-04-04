import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './ws-jwt-guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsJwtGuard)
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    try {
      const userId = client.data.user?.sub;
      
      if (!userId) {
        console.log(`Пользователь ${client.id} не подключен: Не найден id пользователя`);
        client.disconnect();
        return;
      }

      client.data.userId = userId;
      
      await client.join(userId);
      
      console.log(`Пользователь ${userId} подключен к комнате`);
      client.emit('connected', { message: 'Подключен к серверу уведомлений'});
      
    } catch (error) {
      console.log(`Ошибка соединения пользователя ${client.id}: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      console.log(`Пользователь ${userId} был отключен от уведомлений`);
    }
  }

  async notifyUser(userId: string, payload: {
    type: 'new_request' | 'request_accepted' | 'request_rejected';
    skillTitle: string;
    fromUser: {
      id: string;
      name: string;
    };
  }) {
    this.server.to(userId).emit('notificateNewRequest', {
      ...payload,
      message: this.getNotificationMessage(payload),
    });
  }

  private getNotificationMessage(payload: any): string {
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