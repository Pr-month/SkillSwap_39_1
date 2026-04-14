import { Test, TestingModule } from '@nestjs/testing';
import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { Reflector } from '@nestjs/core';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { Gender } from 'src/common/enums/gender.enum';
import { DataSource } from 'typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let accessToken: string;
  let refreshToken: string;

const userDto: RegisterDto ={
  name: 'test',
  email: 'test@mail.ru',
  password: 'Test123!@#',
  birthdate:new Date(2001, 1, 1),
  gender: Gender.MALE,
  about: 'about',
  avatar: 'avatar'
}

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get(DataSource);
    
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });
  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE "users" CASCADE');
  });

  afterEach(async () => {
    await app.close();
  });

   describe('POST /auth/register', () => {
    it('Успешная регистрация', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userDto)
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');

      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it('Регистрация существующего пользователя. Статус 409', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userDto);

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userDto)
        .expect(409);

      expect(res.body).toHaveProperty('message');
      expect(res.body.statusCode).toBe(409);
    });

    it('Регистрация пользователя c невалидным паролем. Статус 400', async () => {
      const invalidUser = {
        ...userDto,
        email: `invalid-pwd-@mail.ru`,
        password: 'weak'
      };

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidUser)
        .expect(400);
    });

    it('Регистрация пользователя c невалидной почтой. Статус 400', async () => {
      const invalidUser = {
        ...userDto,
        email: 'email'
      };

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidUser)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userDto);
    });

    it('Успешная аутентификация', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userDto.email,
          password: userDto.password
        })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('Аутентификация с некорректным паролем', async () => {
      const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: userDto.email,
        password: 'password'
      })
      .expect(401);
      expect(res.body.message).toBe('Неверный email или пароль');
    });

    it('Аутентификация с некорректной почтой', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'neEmail@mail.ru',
          password: 'Test123!@#'
        })
        .expect(401);

      expect(res.body.message).toBe('Неверный email или пароль');
    });
  });

  describe('POST /auth/logout', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userDto)
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userDto.email,
          password: userDto.password
        })
        .expect(200);

      refreshToken = loginRes.body.refreshToken;
      expect(refreshToken).toBeDefined();
    });

    it('Успешный logout', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);

      expect(res.body.message).toBe('Выход выполнен успешно');
    });

    it('Logout без токена', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);
    });

    it('Logout c невалидным токеном', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userDto);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userDto.email,
          password: userDto.password
        });

      refreshToken = loginRes.body.refreshToken;
    });

    it('Рефреш токена успешный', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.accessToken).not.toBe(undefined);
    });

    it('Рефреш без токена', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(401);
    });

    it('Рефреш с невалидным токеном', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});