import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { User } from '../users/entities/user.entity';
import { Gender } from '../common/enums/gender.enum';
import { Role } from '../common/enums/role.enum';
import { Skill } from '../skills/entities/skill.entity';
import { Request } from './entities/request.entity';
import { RequestStatus } from '../common/enums/request-status.enum';
import { In } from 'typeorm';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { UsersService } from '../users/users.service';
import { SkillsService } from '../skills/skills.service';

type RequestsRepositoryMock = {
  findAndCount: jest.Mock<Promise<[Request[], number]>, [unknown]>;
  create: jest.Mock<Request, [Partial<Request>]>;
  save: jest.Mock<Promise<Request>, [Request]>;
  findOne: jest.Mock<Promise<Request | null>, [unknown]>;
  delete: jest.Mock<Promise<any>, [string | string[]]>;
};

type UsersRepositoryMock = {
  findOne: jest.Mock<Promise<User | null>, [unknown]>;
};

type SkillsRepositoryMock = {
  findOne: jest.Mock<Promise<Skill | null>, [unknown]>;
};

type NotificationsGatewayMock = {
  notifyUser: jest.Mock<Promise<void>, [string, unknown]>;
};

type UsersServiceMock = {
  findOne: jest.Mock<Promise<User>, [string]>;
};

type SkillsServiceMock = Record<string, never>;

describe('RequestsService', () => {
  let service: RequestsService;
  let requestsRepository: RequestsRepositoryMock;
  let usersRepository: UsersRepositoryMock;
  let skillsRepository: SkillsRepositoryMock;
  let notificationsGateway: NotificationsGatewayMock;
  let usersService: UsersServiceMock;
  let skillsService: SkillsServiceMock;

  const mockRequests = [
    {
      id: '1',
      senderId: '1',
      receiverId: '2',
      status: RequestStatus.IN_PROGRESS,
      offeredSkillId: '3',
      requestedSkillId: '4',
      isRead: true,
      sender: { id: '1' } as User,
      receiver: { id: '2', name: 'test2' } as User,
      offeredSkill: { id: '3' } as Skill,
      requestedSkill: { id: '4', title: 'Backend' } as Skill,
    },
    {
      id: '2',
      senderId: '2',
      receiverId: '1',
      status: RequestStatus.PENDING,
      offeredSkillId: '4',
      requestedSkillId: '3',
      isRead: false,
      sender: { id: '2', name: 'test2' } as User,
      receiver: { id: '1' } as User,
      offeredSkill: { id: '4' } as Skill,
      requestedSkill: { id: '3' } as Skill,
    },
  ] as Request[];

  const mockUsers = [
    {
      id: '1',
      name: 'test',
      email: 'test@yand.ru',
      about: 'test about',
      city: 'city',
      gender: Gender.FEMALE,
      avatar: 'test.jpg',
      role: Role.USER,
    },
    {
      id: '2',
      name: 'test2',
      email: 'test2@yand.ru',
      about: 'test about 2',
      city: 'town',
      gender: Gender.MALE,
      avatar: 'test22.jpg',
      role: Role.USER,
    },
  ] as User[];

  const mockSkills = [
    {
      id: '3',
      title: 'JS',
      description: 'test try JS',
      owner: { id: '1' },
      category: { id: '738', title: 'science' },
    },
    {
      id: '4',
      title: 'Backend',
      description: 'test try backend',
      owner: { id: '2' },
      category: { id: '541', title: 'science' },
    },
  ] as unknown as Skill[];

  beforeEach(async () => {
    requestsRepository = {
      findAndCount: jest.fn<Promise<[Request[], number]>, [unknown]>(),
      create: jest.fn<Request, [Partial<Request>]>(),
      save: jest.fn<Promise<Request>, [Request]>(),
      findOne: jest.fn<Promise<Request | null>, [unknown]>(),
      delete: jest.fn<Promise<any>, [string | string[]]>(),
    };

    usersRepository = {
      findOne: jest.fn<Promise<User | null>, [unknown]>(),
    };

    skillsRepository = {
      findOne: jest.fn<Promise<Skill | null>, [unknown]>(),
    };

    notificationsGateway = {
      notifyUser: jest.fn<Promise<void>, [string, unknown]>(),
    };

    usersService = {
      findOne: jest.fn<Promise<User>, [string]>(),
    };

    skillsService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: NotificationsGateway,
          useValue: notificationsGateway,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: SkillsService,
          useValue: skillsService,
        },
        {
          provide: getRepositoryToken(Request),
          useValue: requestsRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
        {
          provide: getRepositoryToken(Skill),
          useValue: skillsRepository,
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('сервис должен определяться', () => {
    expect(service).toBeDefined();
  });

  describe('проверка метода findOutgoing', () => {
    const totalReqMock = 20;
    const pageMock = 1;
    const limitMock = 5;

    it('проверка успешного ответа', async () => {
      requestsRepository.findAndCount.mockResolvedValue([
        [mockRequests[0]],
        totalReqMock,
      ]);

      const result = await service.findOutgoing(
        mockRequests[0].senderId,
        pageMock,
        limitMock,
      );

      expect(requestsRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          senderId: mockRequests[0].senderId,
          status: In([RequestStatus.IN_PROGRESS, RequestStatus.PENDING]),
        },
        relations: {
          receiver: true,
          offeredSkill: true,
          requestedSkill: true,
        },
        order: { createdAt: 'DESC' },
        take: limitMock,
        skip: (pageMock - 1) * limitMock,
      });

      expect(result.data).toEqual([mockRequests[0]]);
      expect(result.pagination).toEqual({
        page: pageMock,
        limit: limitMock,
        total: totalReqMock,
        totalPage: Math.ceil(totalReqMock / limitMock),
      });
    });

    it('проверка успешного ответа с параметрами пагинации по умолчанию', async () => {
      requestsRepository.findAndCount.mockResolvedValue([
        [mockRequests[0]],
        totalReqMock,
      ]);

      const result = await service.findOutgoing(mockRequests[0].senderId);

      expect(requestsRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          senderId: mockRequests[0].senderId,
          status: In([RequestStatus.IN_PROGRESS, RequestStatus.PENDING]),
        },
        relations: {
          receiver: true,
          offeredSkill: true,
          requestedSkill: true,
        },
        order: { createdAt: 'DESC' },
        take: 10,
        skip: 0,
      });

      expect(result.data).toEqual([mockRequests[0]]);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: totalReqMock,
        totalPage: Math.ceil(totalReqMock / 10),
      });
    });

    it('проверка обработки page > 1', async () => {
      requestsRepository.findAndCount.mockResolvedValue([
        [mockRequests[0]],
        totalReqMock,
      ]);

      await service.findOutgoing(mockRequests[0].senderId, -10);

      expect(requestsRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          senderId: mockRequests[0].senderId,
          status: In([RequestStatus.IN_PROGRESS, RequestStatus.PENDING]),
        },
        relations: {
          receiver: true,
          offeredSkill: true,
          requestedSkill: true,
        },
        order: { createdAt: 'DESC' },
        take: 10,
        skip: 0,
      });
    });

    it('проверка обработки limit < 1', async () => {
      requestsRepository.findAndCount.mockResolvedValue([
        [mockRequests[0]],
        totalReqMock,
      ]);

      await service.findOutgoing(mockRequests[0].senderId, 1, -10);

      expect(requestsRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          senderId: mockRequests[0].senderId,
          status: In([RequestStatus.IN_PROGRESS, RequestStatus.PENDING]),
        },
        relations: {
          receiver: true,
          offeredSkill: true,
          requestedSkill: true,
        },
        order: { createdAt: 'DESC' },
        take: 10,
        skip: 0,
      });
    });

    it('проверка обработки limit > 100', async () => {
      requestsRepository.findAndCount.mockResolvedValue([
        [mockRequests[0]],
        totalReqMock,
      ]);

      await service.findOutgoing(mockRequests[0].senderId, 1, 150);

      expect(requestsRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          senderId: mockRequests[0].senderId,
          status: In([RequestStatus.IN_PROGRESS, RequestStatus.PENDING]),
        },
        relations: {
          receiver: true,
          offeredSkill: true,
          requestedSkill: true,
        },
        order: { createdAt: 'DESC' },
        take: 100,
        skip: 0,
      });
    });

    it('проверка ошибки при запросе несуществующего пользователя или запросов', async () => {
      requestsRepository.findAndCount.mockResolvedValue([[], 0]);

      await expect(
        service.findOutgoing(mockRequests[0].senderId),
      ).rejects.toThrow(NotFoundException);

      expect(requestsRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          senderId: mockRequests[0].senderId,
          status: In([RequestStatus.IN_PROGRESS, RequestStatus.PENDING]),
        },
        relations: {
          receiver: true,
          offeredSkill: true,
          requestedSkill: true,
        },
        order: { createdAt: 'DESC' },
        take: 10,
        skip: 0,
      });
    });
  });

  describe('проверка метода findIncoming', () => {
    const totalReqMock = 20;
    const pageMock = 1;
    const limitMock = 5;

    it('проверка успешного ответа', async () => {
      requestsRepository.findAndCount.mockResolvedValue([
        [mockRequests[1]],
        totalReqMock,
      ]);

      const result = await service.findIncoming(
        mockRequests[1].receiverId,
        pageMock,
        limitMock,
      );

      expect(requestsRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          receiverId: mockRequests[1].receiverId,
          status: In([RequestStatus.IN_PROGRESS, RequestStatus.PENDING]),
        },
        relations: {
          sender: true,
          offeredSkill: true,
          requestedSkill: true,
        },
        order: { createdAt: 'DESC' },
        take: limitMock,
        skip: (pageMock - 1) * limitMock,
      });

      expect(result.data).toEqual([mockRequests[1]]);
      expect(result.pagination).toEqual({
        page: pageMock,
        limit: limitMock,
        total: totalReqMock,
        totalPage: Math.ceil(totalReqMock / limitMock),
      });
    });

    it('проверка успешного ответа с параметрами пагинации по умолчанию', async () => {
      requestsRepository.findAndCount.mockResolvedValue([
        [mockRequests[1]],
        totalReqMock,
      ]);

      const result = await service.findIncoming(mockRequests[1].receiverId);

      expect(requestsRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          receiverId: mockRequests[1].receiverId,
          status: In([RequestStatus.IN_PROGRESS, RequestStatus.PENDING]),
        },
        relations: {
          sender: true,
          offeredSkill: true,
          requestedSkill: true,
        },
        order: { createdAt: 'DESC' },
        take: 10,
        skip: 0,
      });

      expect(result.data).toEqual([mockRequests[1]]);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: totalReqMock,
        totalPage: Math.ceil(totalReqMock / 10),
      });
    });

    it('проверка обработки page > 1', async () => {
      requestsRepository.findAndCount.mockResolvedValue([
        [mockRequests[1]],
        totalReqMock,
      ]);

      await service.findIncoming(mockRequests[1].receiverId, -10);

      expect(requestsRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          receiverId: mockRequests[1].receiverId,
          status: In([RequestStatus.IN_PROGRESS, RequestStatus.PENDING]),
        },
        relations: {
          sender: true,
          offeredSkill: true,
          requestedSkill: true,
        },
        order: { createdAt: 'DESC' },
        take: 10,
        skip: 0,
      });
    });

    it('проверка обработки limit < 1', async () => {
      requestsRepository.findAndCount.mockResolvedValue([
        [mockRequests[1]],
        totalReqMock,
      ]);

      await service.findIncoming(mockRequests[1].receiverId, 1, -10);

      expect(requestsRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          receiverId: mockRequests[1].receiverId,
          status: In([RequestStatus.IN_PROGRESS, RequestStatus.PENDING]),
        },
        relations: {
          sender: true,
          offeredSkill: true,
          requestedSkill: true,
        },
        order: { createdAt: 'DESC' },
        take: 10,
        skip: 0,
      });
    });

    it('проверка обработки limit > 100', async () => {
      requestsRepository.findAndCount.mockResolvedValue([
        [mockRequests[1]],
        totalReqMock,
      ]);

      await service.findIncoming(mockRequests[1].receiverId, 1, 150);

      expect(requestsRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          receiverId: mockRequests[1].receiverId,
          status: In([RequestStatus.IN_PROGRESS, RequestStatus.PENDING]),
        },
        relations: {
          sender: true,
          offeredSkill: true,
          requestedSkill: true,
        },
        order: { createdAt: 'DESC' },
        take: 100,
        skip: 0,
      });
    });

    it('проверка ошибки при запросе несуществующего пользователя или запросов', async () => {
      requestsRepository.findAndCount.mockResolvedValue([[], 0]);

      await expect(
        service.findIncoming(mockRequests[0].receiverId),
      ).rejects.toThrow(NotFoundException);

      expect(requestsRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          receiverId: mockRequests[0].receiverId,
          status: In([RequestStatus.IN_PROGRESS, RequestStatus.PENDING]),
        },
        relations: {
          sender: true,
          offeredSkill: true,
          requestedSkill: true,
        },
        order: { createdAt: 'DESC' },
        take: 10,
        skip: 0,
      });
    });
  });

  describe('проверка метода create', () => {
    const dtoMock = {
      requestedSkillId: '4',
      offeredSkillId: '3',
    };

    it('проверка успешного ответа', async () => {
      skillsRepository.findOne
        .mockResolvedValueOnce(mockSkills[1]) //Первый вызов метода репозитория в create вернет запрашиваемый навык
        .mockResolvedValueOnce(mockSkills[0]); //Предлагаемый навык
      usersService.findOne.mockResolvedValue(mockUsers[0]);
      notificationsGateway.notifyUser.mockResolvedValue(undefined);

      //пусть 1 объект из mockRequests соответствует такому запросу
      requestsRepository.create.mockReturnValue(mockRequests[0]);
      requestsRepository.save.mockResolvedValue(mockRequests[0]);

      const result = await service.create(mockRequests[0].senderId, dtoMock);

      expect(skillsRepository.findOne).toHaveBeenCalledTimes(2);
      expect(requestsRepository.create).toHaveBeenCalledWith({
        sender: { id: mockRequests[0].senderId },
        receiver: { id: mockSkills[1].owner.id },
        offeredSkill: { id: dtoMock.offeredSkillId },
        requestedSkill: { id: dtoMock.requestedSkillId },
      });
      expect(requestsRepository.save).toHaveBeenCalledWith(mockRequests[0]);
      expect(result).toEqual(mockRequests[0]);
    });

    it('проверка успешного ответа при пустом поле offeredSkillId в dto', async () => {
      const reqestMock = {
        id: '1',
        senderId: '1',
        receiverId: '2',
        status: RequestStatus.IN_PROGRESS,
        requestedSkillId: '4',
        isRead: true,
        sender: { id: '1' } as User,
        receiver: { id: '2' } as User,
        requestedSkill: { id: '4' } as Skill,
      } as Request;
      skillsRepository.findOne.mockResolvedValueOnce(mockSkills[1]);
      usersService.findOne.mockResolvedValue(mockUsers[0]);
      notificationsGateway.notifyUser.mockResolvedValue(undefined);

      requestsRepository.create.mockReturnValue(reqestMock);
      requestsRepository.save.mockResolvedValue(reqestMock);

      const result = await service.create(reqestMock.senderId, {
        requestedSkillId: '4',
      });

      expect(skillsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(requestsRepository.create).toHaveBeenCalledWith({
        sender: { id: reqestMock.senderId },
        receiver: { id: mockSkills[1].owner.id },
        offeredSkill: { id: undefined },
        requestedSkill: { id: dtoMock.requestedSkillId },
      });
      expect(requestsRepository.save).toHaveBeenCalledWith(reqestMock);
      expect(result).toEqual(reqestMock);
    });

    it('проверка ошибки при запросе с несуществующим запрашиваемым навыком', async () => {
      skillsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create('5', { requestedSkillId: '10' }),
      ).rejects.toThrow(NotFoundException);
      expect(skillsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(requestsRepository.create).not.toHaveBeenCalled();
      expect(requestsRepository.save).not.toHaveBeenCalled();
    });

    it('проверка ошибки при запросе с несуществующим предлагаемым навыком', async () => {
      skillsRepository.findOne
        .mockResolvedValueOnce(mockSkills[1])
        .mockResolvedValueOnce(null);

      await expect(service.create('5', dtoMock)).rejects.toThrow(
        NotFoundException,
      );
      expect(skillsRepository.findOne).toHaveBeenCalledTimes(2);
      expect(requestsRepository.create).not.toHaveBeenCalled();
      expect(requestsRepository.save).not.toHaveBeenCalled();
    });

    it('проверка ошибки если отправитель совпадает с получателем', async () => {
      skillsRepository.findOne.mockResolvedValue(mockSkills[1]);

      await expect(service.create('2', dtoMock)).rejects.toThrow(
        BadRequestException,
      );
      expect(skillsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(requestsRepository.create).not.toHaveBeenCalled();
      expect(requestsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('проверка метода update', () => {
    const dtoMock = { status: RequestStatus.ACCEPTED };

    it('проверка успешного ответа', async () => {
      requestsRepository.findOne.mockResolvedValue(mockRequests[0]);
      notificationsGateway.notifyUser.mockResolvedValue(undefined);
      const updateMockRequest = {
        ...mockRequests[0],
        status: dtoMock.status,
      } as Request;
      const userIdMock = '2';
      requestsRepository.save.mockResolvedValue(updateMockRequest);

      const result = await service.update(
        mockRequests[0].id,
        userIdMock,
        dtoMock,
      );

      expect(requestsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(requestsRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockRequests[0].id },
        relations: {
          sender: true,
          receiver: true,
          requestedSkill: true,
        },
      });
      expect(result).toEqual(updateMockRequest);
    });

    it('проверка ошибки при запросе с несуществующей заявкой', async () => {
      requestsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(mockRequests[0].id, '1', dtoMock),
      ).rejects.toThrow(NotFoundException);
      expect(requestsRepository.save).not.toHaveBeenCalled();
    });

    it('проверка ошибки при запросе обновления статуса заявки, отправленной пользователем', async () => {
      requestsRepository.findOne.mockResolvedValue(mockRequests[0]);
      const userIdMock = '1';

      await expect(
        service.update(mockRequests[0].id, userIdMock, dtoMock),
      ).rejects.toThrow(ForbiddenException);
      expect(requestsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('проверка метода remove', () => {
    it('проверка успешного ответа, если пользователь удаляет свою заявку', async () => {
      requestsRepository.findOne.mockResolvedValue(mockRequests[0]);
      usersRepository.findOne.mockResolvedValue(mockUsers[0]);
      requestsRepository.delete.mockResolvedValue(undefined);

      const result = await service.remove(mockRequests[0].id, mockUsers[0].id);

      expect(requestsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(result.message).toBe('Заявка успешно удалена');
    });

    it('проверка успешного ответа, если пользователь имеет роль админа', async () => {
      requestsRepository.findOne.mockResolvedValue(mockRequests[0]);
      usersRepository.findOne.mockResolvedValue({
        ...mockUsers[0],
        role: Role.ADMIN,
      } as User);
      requestsRepository.delete.mockResolvedValue(undefined);

      const result = await service.remove(mockRequests[0].id, mockUsers[0].id);

      expect(requestsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(result.message).toBe('Заявка успешно удалена');
    });

    it('проверка ошибки при запросе с несуществующей заявкой', async () => {
      requestsRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('1', '1')).rejects.toThrow(NotFoundException);
      expect(usersRepository.findOne).not.toHaveBeenCalled();
      expect(requestsRepository.delete).not.toHaveBeenCalled();
    });

    it('проверка ошибки при запросе с несуществующим пользователем', async () => {
      requestsRepository.findOne.mockResolvedValue(mockRequests[0]);
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('1', '1')).rejects.toThrow(NotFoundException);
      expect(requestsRepository.delete).not.toHaveBeenCalled();
    });

    it('проверка ошибки при попытке удаления пользователем без роли ADMIN не своего запроса', async () => {
      requestsRepository.findOne.mockResolvedValue(mockRequests[0]);
      usersRepository.findOne.mockResolvedValue(mockUsers[1]);
      requestsRepository.delete.mockResolvedValue(undefined);

      await expect(
        service.remove(mockRequests[0].id, mockUsers[1].id),
      ).rejects.toThrow(ForbiddenException);
      expect(requestsRepository.delete).not.toHaveBeenCalled();
    });
  });
});
