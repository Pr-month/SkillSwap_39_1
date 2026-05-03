import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request, { Response } from 'supertest';
import { App } from 'supertest/types';
import * as http from 'http';
import { DataSource, Repository } from 'typeorm';

import { AppModule } from 'src/app.module';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { Gender } from 'src/common/enums/gender.enum';
import { Category } from 'src/categories/entities/category.entity';

type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
};

type ErrorResponse = {
  message: string | string[];
  statusCode?: number;
};

function getTypedBody<T>(response: Response): T {
  return response.body as T;
}

jest.setTimeout(20000);

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let server: http.Server;
  let dataSource: DataSource;
  let categoryRepository: Repository<Category>;
  let category: Category;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get(DataSource);
    categoryRepository = dataSource.getRepository(Category);

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    server = app.getHttpServer() as http.Server;
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
    category = await createCategory('Backend');
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  async function createCategory(name: string): Promise<Category> {
    const nextCategory = new Category();

    nextCategory.name = name;
    nextCategory.parentId = null;
    nextCategory.parent = null;
    nextCategory.children = [];
    nextCategory.skills = [];

    return categoryRepository.save(nextCategory);
  }

  function buildUserDto(
    overrides: Partial<RegisterDto> = {},
    emailPrefix = 'test-user',
  ): RegisterDto {
    return {
      name: 'Тестовый пользователь',
      email: `${emailPrefix}-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}@mail.ru`,
      password: 'Test123!@#',
      birthdate: new Date('2001-02-01T00:00:00.000Z'),
      city: 'Москва',
      gender: Gender.MALE,
      about: 'about',
      avatar: 'avatar',
      categoryId: category.id,
      ...overrides,
    };
  }

  describe('POST /auth/register', () => {
    it('Успешная регистрация возвращает accessToken и refreshToken', async () => {
      const userDto = buildUserDto();

      const res = await request(server)
        .post('/auth/register')
        .send(userDto)
        .expect(201);
      const body = getTypedBody<AuthTokensResponse>(res);

      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).toBeDefined();
    });

    it('Повторная регистрация с тем же email возвращает 409', async () => {
      const userDto = buildUserDto({}, 'duplicate-user');

      await request(server).post('/auth/register').send(userDto).expect(201);

      const res = await request(server)
        .post('/auth/register')
        .send(userDto)
        .expect(409);
      const body = getTypedBody<ErrorResponse>(res);

      expect(body.statusCode).toBe(409);
      expect(body.message).toBe('Пользователь с таким email уже существует');
    });

    it('Регистрация с невалидным паролем возвращает 400', async () => {
      const invalidUser = buildUserDto(
        {
          password: '12345678',
        },
        'invalid-password-user',
      );

      const res = await request(server)
        .post('/auth/register')
        .send(invalidUser)
        .expect(400);
      const body = getTypedBody<ErrorResponse>(res);

      expect(Array.isArray(body.message)).toBe(true);
      expect(body.message).toContain('password is not strong enough');
    });

    it('Регистрация с невалидной почтой возвращает 400', async () => {
      const invalidUser = buildUserDto({
        email: 'email',
      });

      await request(server)
        .post('/auth/register')
        .send(invalidUser)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    let userDto: RegisterDto;

    beforeEach(async () => {
      userDto = buildUserDto({}, 'login-user');
      await request(server).post('/auth/register').send(userDto).expect(201);
    });

    it('Успешная аутентификация', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({
          email: userDto.email,
          password: userDto.password,
        })
        .expect(200);
      const body = getTypedBody<AuthTokensResponse>(res);

      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).toBeDefined();
    });

    it('Аутентификация с некорректным паролем', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({
          email: userDto.email,
          password: 'password',
        })
        .expect(401);
      const body = getTypedBody<ErrorResponse>(res);

      expect(body.message).toBe('Неверный email или пароль');
    });

    it('Аутентификация с некорректной почтой', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({
          email: 'neEmail@mail.ru',
          password: 'Test123!@#',
        })
        .expect(401);
      const body = getTypedBody<ErrorResponse>(res);

      expect(body.message).toBe('Неверный email или пароль');
    });
  });

  describe('POST /auth/logout', () => {
    let refreshToken: string;
    let userDto: RegisterDto;

    beforeEach(async () => {
      userDto = buildUserDto({}, 'logout-user');

      await request(server).post('/auth/register').send(userDto).expect(201);

      const loginRes = await request(server)
        .post('/auth/login')
        .send({
          email: userDto.email,
          password: userDto.password,
        })
        .expect(200);
      const tokens = getTypedBody<AuthTokensResponse>(loginRes);

      refreshToken = tokens.refreshToken;
      expect(refreshToken).toBeDefined();
    });

    it('Успешный logout', async () => {
      const res = await request(server)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);
      const body = getTypedBody<ErrorResponse>(res);

      expect(body.message).toBe('Выход выполнен успешно');
    });

    it('Logout без токена', async () => {
      await request(server).post('/auth/logout').expect(401);
    });

    it('Logout c невалидным токеном', async () => {
      await request(server)
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;
    let userDto: RegisterDto;

    beforeEach(async () => {
      userDto = buildUserDto({}, 'refresh-user');

      await request(server).post('/auth/register').send(userDto).expect(201);

      const loginRes = await request(server)
        .post('/auth/login')
        .send({
          email: userDto.email,
          password: userDto.password,
        })
        .expect(200);
      const tokens = getTypedBody<AuthTokensResponse>(loginRes);

      refreshToken = tokens.refreshToken;
    });

    it('Рефреш токена успешный', async () => {
      const res = await request(server)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);
      const body = getTypedBody<AuthTokensResponse>(res);

      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).toBeDefined();
    });

    it('Рефреш без токена', async () => {
      await request(server).post('/auth/refresh').expect(401);
    });

    it('Рефреш с невалидным токеном', async () => {
      await request(server)
        .post('/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
