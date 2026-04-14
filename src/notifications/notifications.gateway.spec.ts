import { Test, TestingModule } from '@nestjs/testing';
import { WsJwtGuard } from '../auth/guards/ws-jwt-guard';
import { NotificationsGateway } from './notifications.gateway';

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
    const client = {
      id: 'socket-id',
      data: {
        user: {
          sub: 'user-id',
        },
      },
      join: jest.fn().mockResolvedValue(undefined),
      emit: jest.fn(),
      disconnect: jest.fn(),
    };

    wsJwtGuard.validateToken.mockResolvedValue(true);

    await gateway.handleConnection(client as any);

    expect(wsJwtGuard.validateToken).toHaveBeenCalledWith(client);
    expect(client.data.userId).toBe('user-id');
    expect(client.join).toHaveBeenCalledWith('user-id');
    expect(client.emit).toHaveBeenCalledWith('connected', {
      message: 'Подключен к серверу уведомлений',
    });
    expect(client.disconnect).not.toHaveBeenCalled();
  });

  it('handleConnection должен отключать клиента, если после валидации токена не найден userId', async () => {
    const client = {
      id: 'socket-id',
      data: {},
      join: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    };

    wsJwtGuard.validateToken.mockResolvedValue(true);

    await gateway.handleConnection(client as any);

    expect(client.disconnect).toHaveBeenCalled();
    expect(client.join).not.toHaveBeenCalled();
    expect(client.emit).not.toHaveBeenCalled();
  });

  it('handleConnection должен отключать клиента при ошибке валидации токена', async () => {
    const client = {
      id: 'socket-id',
      data: {},
      join: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    };

    wsJwtGuard.validateToken.mockRejectedValue(new Error('Invalid token'));

    await gateway.handleConnection(client as any);

    expect(client.disconnect).toHaveBeenCalled();
    expect(client.join).not.toHaveBeenCalled();
    expect(client.emit).not.toHaveBeenCalled();
  });

  it('handleConnect должен добавлять пользователя в комнату', () => {
    const client = {
      data: {
        user: {
          sub: 'user-id',
        },
      },
      join: jest.fn(),
    };

    gateway.handleConnect(client as any);

    expect(client.join).toHaveBeenCalledWith('user-id');
  });

  it('notifyUser должен отправлять уведомление о новой заявке', async () => {
    gateway.server = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    } as any;

    await gateway.notifyUser('user-id', {
      type: 'new_request',
      skillTitle: 'NestJS',
      fromUser: {
        id: 'sender-id',
        name: 'Иван',
      },
    });

    expect(gateway.server.to).toHaveBeenCalledWith('user-id');
    expect(gateway.server.to('user-id').emit).toHaveBeenCalledWith(
      'notificateNewRequest',
      {
        type: 'new_request',
        skillTitle: 'NestJS',
        fromUser: {
          id: 'sender-id',
          name: 'Иван',
        },
        message: 'Вам направили заявку на навык NestJS от Иван',
      },
    );
  });
});
