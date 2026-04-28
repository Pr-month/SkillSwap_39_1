import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { WsJwtGuard } from '../auth/guards/ws-jwt-guard';
import { Role } from '../common/enums/role.enum';
import { NotificationsGateway } from './notifications.gateway';

type GatewayClient = Parameters<NotificationsGateway['handleConnection']>[0];
type ConnectClient = Parameters<NotificationsGateway['handleConnect']>[0];

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let wsJwtGuard: { validateToken: jest.Mock };

  beforeEach(async () => {
    wsJwtGuard = {
      validateToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        {
          provide: WsJwtGuard,
          useValue: wsJwtGuard,
        },
      ],
    }).compile();

    gateway = module.get<NotificationsGateway>(NotificationsGateway);
  });

  it('gateway должен определяться', () => {
    expect(gateway).toBeDefined();
  });

  it('handleConnection должен подключать пользователя к его комнате и отправлять событие connected', async () => {
    const join = jest.fn().mockResolvedValue(undefined);
    const emit = jest.fn();
    const disconnect = jest.fn();

    const client = {
      id: 'socket-id',
      data: {
        user: {
          sub: 'user-id',
          email: 'user@example.com',
          role: Role.USER,
        },
      },
      join,
      emit,
      disconnect,
    } as unknown as GatewayClient;

    wsJwtGuard.validateToken.mockResolvedValue({
      sub: 'user-id',
      email: 'user@example.com',
      role: Role.USER,
    });

    await gateway.handleConnection(client);

    expect(wsJwtGuard.validateToken).toHaveBeenCalledWith(client);
    expect(client.data.userId).toBe('user-id');
    expect(join).toHaveBeenCalledWith('user-id');
    expect(emit).toHaveBeenCalledWith('connected', {
      message: 'Подключен к серверу уведомлений',
    });
    expect(disconnect).not.toHaveBeenCalled();
  });

  it('handleConnection должен отключать клиента, если после валидации токена не найден userId', async () => {
    const join = jest.fn();
    const emit = jest.fn();
    const disconnect = jest.fn();

    const client = {
      id: 'socket-id',
      data: {},
      join,
      emit,
      disconnect,
    } as unknown as GatewayClient;

    wsJwtGuard.validateToken.mockResolvedValue({
      sub: '',
      email: 'user@example.com',
      role: Role.USER,
    });

    await gateway.handleConnection(client);

    expect(disconnect).toHaveBeenCalled();
    expect(join).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('handleConnection должен отключать клиента при ошибке валидации токена', async () => {
    const join = jest.fn();
    const emit = jest.fn();
    const disconnect = jest.fn();

    const client = {
      id: 'socket-id',
      data: {},
      join,
      emit,
      disconnect,
    } as unknown as GatewayClient;

    wsJwtGuard.validateToken.mockRejectedValue(new Error('Invalid token'));

    await gateway.handleConnection(client);

    expect(disconnect).toHaveBeenCalled();
    expect(join).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('handleConnect должен добавлять пользователя в комнату', () => {
    const join = jest.fn();

    const client = {
      data: {
        user: {
          sub: 'user-id',
          email: 'user@example.com',
          role: Role.USER,
        },
      },
      join,
    } as unknown as ConnectClient;

    gateway.handleConnect(client);

    expect(join).toHaveBeenCalledWith('user-id');
  });

  it('notifyUser должен отправлять уведомление о новой заявке', () => {
    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({
      emit,
    });

    gateway.server = {
      to,
    } as unknown as Server;

    gateway.notifyUser('user-id', {
      type: 'new_request',
      skillTitle: 'NestJS',
      fromUser: {
        id: 'sender-id',
        name: 'Иван',
      },
    });

    expect(to).toHaveBeenCalledWith('user-id');
    expect(emit).toHaveBeenCalledWith('notificateNewRequest', {
      type: 'new_request',
      skillTitle: 'NestJS',
      fromUser: {
        id: 'sender-id',
        name: 'Иван',
      },
      message: 'Вам направили заявку на навык NestJS от Иван',
    });
  });
});
