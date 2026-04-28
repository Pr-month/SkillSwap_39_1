import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import request, { Response } from 'supertest';
import { App } from 'supertest/types';
import * as http from 'http';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from 'src/app.module';
import { AllExceptionFilter } from 'src/common/filters/all-exception.filter';
import { Role } from 'src/common/enums/role.enum';
import { RequestStatus } from 'src/common/enums/request-status.enum';
import { Category } from 'src/categories/entities/category.entity';
import { Request as RequestEntity } from 'src/requests/entities/request.entity';
import { Skill } from 'src/skills/entities/skill.entity';
import { User } from 'src/users/entities/user.entity';

type RequestListItem = {
  id: string;
  senderId: string;
  receiverId: string;
  status: RequestStatus;
  offeredSkill: { id: string; title: string };
  requestedSkill: { id: string; title: string };
  receiver?: { id: string; name: string };
  sender?: { id: string; name: string };
};

type RequestsListResponse = {
  data: RequestListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
};

type ErrorResponse = {
  message: string | string[];
  statusCode: number;
};

function getTypedBody<T>(response: Response): T {
  return response.body as T;
}

jest.setTimeout(20000);

describe('Тест e2e для requests', () => {
  let app: INestApplication<App>;
  let server: http.Server;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let categoryRepository: Repository<Category>;
  let userRepository: Repository<User>;
  let skillRepository: Repository<Skill>;
  let requestRepository: Repository<RequestEntity>;

  beforeAll(async () => {
    const moduleApp: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleApp.createNestApplication();
    dataSource = moduleApp.get(DataSource);
    jwtService = moduleApp.get(JwtService);
    categoryRepository = dataSource.getRepository(Category);
    userRepository = dataSource.getRepository(User);
    skillRepository = dataSource.getRepository(Skill);
    requestRepository = dataSource.getRepository(RequestEntity);

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    app.useGlobalFilters(new AllExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    server = app.getHttpServer() as http.Server;
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  async function createUser(params: {
    name: string;
    email: string;
    role?: Role;
  }): Promise<User> {
    const user = new User();

    user.name = params.name;
    user.email = params.email;
    user.password = 'seed-password';
    user.about = '';
    user.birthdate = null;
    user.city = '';
    user.gender = null as never;
    user.avatar = '';
    user.role = params.role ?? Role.USER;
    user.refreshToken = null;
    user.wantToLearn = [];
    user.favoriteSkills = [];
    user.skills = [];
    user.sentRequests = [];
    user.receivedRequests = [];

    return userRepository.save(user);
  }

  async function createSkill(params: {
    title: string;
    owner: User;
    category: Category;
  }): Promise<Skill> {
    return skillRepository.save(
      skillRepository.create({
        title: params.title,
        description: '',
        images: [],
        owner: params.owner,
        category: params.category,
      }),
    );
  }

  async function createAccessToken(user: User): Promise<string> {
    return jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  it('GET /requests/outgoing должен возвращать исходящие заявки пользователя с пагинацией', async () => {
    const category = await categoryRepository.save(
      categoryRepository.create({
        name: 'Категория для заявок',
        parentId: null,
      }),
    );

    const sender = await createUser({
      name: 'Отправитель',
      email: 'sender@example.com',
    });
    const receiverOne = await createUser({
      name: 'Получатель 1',
      email: 'receiver-one@example.com',
    });
    const receiverTwo = await createUser({
      name: 'Получатель 2',
      email: 'receiver-two@example.com',
    });
    const anotherSender = await createUser({
      name: 'Другой отправитель',
      email: 'another-sender@example.com',
    });

    const offeredSkillOne = await createSkill({
      title: 'Frontend',
      owner: sender,
      category,
    });
    const offeredSkillTwo = await createSkill({
      title: 'Backend',
      owner: sender,
      category,
    });
    const requestedSkillOne = await createSkill({
      title: 'UX/UI',
      owner: receiverOne,
      category,
    });
    const requestedSkillTwo = await createSkill({
      title: 'DevOps',
      owner: receiverTwo,
      category,
    });
    const requestedSkillThree = await createSkill({
      title: 'QA',
      owner: receiverTwo,
      category,
    });
    const anotherOfferedSkill = await createSkill({
      title: 'Analytics',
      owner: anotherSender,
      category,
    });

    await requestRepository.save([
      requestRepository.create({
        sender,
        receiver: receiverOne,
        senderId: sender.id,
        receiverId: receiverOne.id,
        status: RequestStatus.PENDING,
        offeredSkill: offeredSkillOne,
        offeredSkillId: offeredSkillOne.id,
        requestedSkill: requestedSkillOne,
        requestedSkillId: requestedSkillOne.id,
      }),
      requestRepository.create({
        sender,
        receiver: receiverTwo,
        senderId: sender.id,
        receiverId: receiverTwo.id,
        status: RequestStatus.IN_PROGRESS,
        offeredSkill: offeredSkillTwo,
        offeredSkillId: offeredSkillTwo.id,
        requestedSkill: requestedSkillTwo,
        requestedSkillId: requestedSkillTwo.id,
      }),
      requestRepository.create({
        sender,
        receiver: receiverTwo,
        senderId: sender.id,
        receiverId: receiverTwo.id,
        status: RequestStatus.REJECTED,
        offeredSkill: offeredSkillTwo,
        offeredSkillId: offeredSkillTwo.id,
        requestedSkill: requestedSkillThree,
        requestedSkillId: requestedSkillThree.id,
      }),
      requestRepository.create({
        sender: anotherSender,
        receiver: receiverOne,
        senderId: anotherSender.id,
        receiverId: receiverOne.id,
        status: RequestStatus.PENDING,
        offeredSkill: anotherOfferedSkill,
        offeredSkillId: anotherOfferedSkill.id,
        requestedSkill: requestedSkillOne,
        requestedSkillId: requestedSkillOne.id,
      }),
    ]);

    const accessToken = await createAccessToken(sender);

    const response = await request(server)
      .get('/requests/outgoing')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: 1, limit: 5 })
      .expect(200);
    const body = getTypedBody<RequestsListResponse>(response);

    expect(body.pagination).toEqual({
      page: 1,
      limit: 5,
      total: 2,
      totalPage: 1,
    });
    expect(body.data).toHaveLength(2);

    const firstRequest = body.data.find(
      (item) => item.requestedSkill.title === requestedSkillOne.title,
    );
    const secondRequest = body.data.find(
      (item) => item.requestedSkill.title === requestedSkillTwo.title,
    );

    expect(firstRequest).toBeDefined();
    expect(firstRequest?.senderId).toBe(sender.id);
    expect(firstRequest?.receiverId).toBe(receiverOne.id);
    expect(firstRequest?.status).toBe(RequestStatus.PENDING);
    expect(firstRequest?.receiver?.name).toBe(receiverOne.name);
    expect(firstRequest?.offeredSkill.title).toBe(offeredSkillOne.title);

    expect(secondRequest).toBeDefined();
    expect(secondRequest?.senderId).toBe(sender.id);
    expect(secondRequest?.receiverId).toBe(receiverTwo.id);
    expect(secondRequest?.status).toBe(RequestStatus.IN_PROGRESS);
    expect(secondRequest?.receiver?.name).toBe(receiverTwo.name);
    expect(secondRequest?.offeredSkill.title).toBe(offeredSkillTwo.title);
  });

  it('GET /requests/incoming должен возвращать входящие заявки пользователя с пагинацией', async () => {
    const category = await categoryRepository.save(
      categoryRepository.create({
        name: 'Категория для входящих заявок',
        parentId: null,
      }),
    );

    const receiver = await createUser({
      name: 'Главный получатель',
      email: 'main-receiver@example.com',
    });
    const senderOne = await createUser({
      name: 'Отправитель 1',
      email: 'sender-one@example.com',
    });
    const senderTwo = await createUser({
      name: 'Отправитель 2',
      email: 'sender-two@example.com',
    });

    const requestedSkill = await createSkill({
      title: 'Node.js',
      owner: receiver,
      category,
    });
    const offeredSkillOne = await createSkill({
      title: 'React',
      owner: senderOne,
      category,
    });
    const offeredSkillTwo = await createSkill({
      title: 'Docker',
      owner: senderTwo,
      category,
    });
    const offeredSkillThree = await createSkill({
      title: 'Testing',
      owner: senderTwo,
      category,
    });

    await requestRepository.save([
      requestRepository.create({
        sender: senderOne,
        receiver,
        senderId: senderOne.id,
        receiverId: receiver.id,
        status: RequestStatus.PENDING,
        offeredSkill: offeredSkillOne,
        offeredSkillId: offeredSkillOne.id,
        requestedSkill,
        requestedSkillId: requestedSkill.id,
      }),
      requestRepository.create({
        sender: senderTwo,
        receiver,
        senderId: senderTwo.id,
        receiverId: receiver.id,
        status: RequestStatus.IN_PROGRESS,
        offeredSkill: offeredSkillTwo,
        offeredSkillId: offeredSkillTwo.id,
        requestedSkill,
        requestedSkillId: requestedSkill.id,
      }),
      requestRepository.create({
        sender: senderTwo,
        receiver,
        senderId: senderTwo.id,
        receiverId: receiver.id,
        status: RequestStatus.DONE,
        offeredSkill: offeredSkillThree,
        offeredSkillId: offeredSkillThree.id,
        requestedSkill,
        requestedSkillId: requestedSkill.id,
      }),
    ]);

    const accessToken = await createAccessToken(receiver);

    const response = await request(server)
      .get('/requests/incoming')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: 1, limit: 10 })
      .expect(200);
    const body = getTypedBody<RequestsListResponse>(response);

    expect(body.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      totalPage: 1,
    });
    expect(body.data).toHaveLength(2);

    const firstIncoming = body.data.find(
      (item) => item.senderId === senderOne.id,
    );
    const secondIncoming = body.data.find(
      (item) => item.senderId === senderTwo.id,
    );

    expect(firstIncoming).toBeDefined();
    expect(firstIncoming?.receiverId).toBe(receiver.id);
    expect(firstIncoming?.status).toBe(RequestStatus.PENDING);
    expect(firstIncoming?.sender?.name).toBe(senderOne.name);
    expect(firstIncoming?.offeredSkill.title).toBe(offeredSkillOne.title);

    expect(secondIncoming).toBeDefined();
    expect(secondIncoming?.receiverId).toBe(receiver.id);
    expect(secondIncoming?.status).toBe(RequestStatus.IN_PROGRESS);
    expect(secondIncoming?.sender?.name).toBe(senderTwo.name);
    expect(secondIncoming?.offeredSkill.title).toBe(offeredSkillTwo.title);
  });

  it('GET /requests/outgoing должен возвращать 400 при невалидном limit', async () => {
    const user = await createUser({
      name: 'Пользователь с плохим запросом',
      email: 'query-user@example.com',
    });
    const accessToken = await createAccessToken(user);

    const response = await request(server)
      .get('/requests/outgoing')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ limit: 101 })
      .expect(400);
    const body = getTypedBody<ErrorResponse>(response);

    expect(body.statusCode).toBe(400);
    expect(body.message).toContain('limit must not be greater than 100');
  });
});
