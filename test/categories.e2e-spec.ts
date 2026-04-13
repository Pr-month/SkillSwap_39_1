/**
 * Модуль e2e тестов для категорий
 */
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { App } from 'supertest/types';
import * as http from 'http';
import { AppModule } from 'src/app.module';
import { AllExceptionFilter } from 'src/common/filters/all-exception.filter';

import { hashPassword } from 'src/users/utils/password.util';
import { seedUsersData } from 'src/seeds/user-data.seed';
import { seedAdminData } from 'src/seeds/admin-data.seed';

interface responseLogin {
  accessToken: string;
  refreshToken: string;
}

interface responseCategory {
  id: string;
  name: string;
  parentId: responseCategory | null;
  children: responseCategory[];
}

describe('Тест e2e контроллера категорий', () => {
  let app: INestApplication<App>;
  let server: http.Server;

  let accessToken: string;
  let accessTokenAdmin: string;

  // Перед тестом
  beforeAll(async () => {
    const moduleApp: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleApp.createNestApplication();

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

    // Пользователь (не админ). Логирование
    // беру первого из src/seeds/user-data.seed
    const responseUser = await request(server)
      .post('/auth/login')
      .send({
        email: seedUsersData[0].email,
        password: await hashPassword('123456'),
      })
      .expect(201);

    accessToken = (responseUser.body as responseLogin).accessToken;
    expect(accessToken).toBeDefined();

    // Пользователь (админ). Логирование
    // данные беру из src/seeds/admin-data.seed
    const responseAdmin = await request(server)
      .post('/auth/login')
      .send({
        email: seedAdminData.email,
        password: await hashPassword(seedAdminData.password),
      })
      .expect(201);

    accessTokenAdmin = (responseAdmin.body as responseLogin).accessToken;

    expect(accessTokenAdmin).toBeDefined();
  });

  // После теста, прибраться
  afterAll(async () => {
    await app.close();
  });

  describe('Получить категории', () => {
    it('Получить категории', async () => {
      const responseCategories = await request(server)
        .get('/categories')
        .expect(200);

      expect(Array.isArray(responseCategories.body)).toBe(true);
      const body = responseCategories.body as responseCategory[];

      if (body.length > 0) {
        const category = body[0];

        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('parent');
        expect(category).toHaveProperty('children');
      }
    });
  });

  describe('Получить одну категорию', () => {
    it('Получить категорию по id', async () => {
      // ID не знаю, надо взять все
      const responseAll = await request(server).get('/categories').expect(200);

      const listBody = responseAll.body as responseCategory[];
      if (listBody.length > 0) {
        // Если что-то есть, то дёрнуть
        const responseOne = await request(server)
          .get(`/categories/${listBody[0].id}`)
          .expect(200);

        const category = responseOne.body as responseCategory;

        expect(category).toHaveProperty('id', listBody[0].id);
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('parent');
        expect(category).toHaveProperty('children');
      }
    });

    it('Несуществующий id, ответ 404', async () => {
      await request(server).get('/categories/1234567890987654321').expect(404);
    });
  });

  describe('Создание категорий', () => {
    it('Создание новой категории', async () => {
      const nameCategory = 'Новая категория';
      const responseCategory = await request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${accessTokenAdmin}`)
        .send({
          name: nameCategory,
        })
        .expect(201);

      const category = responseCategory.body as responseCategory;

      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name', nameCategory);
      expect(category).toHaveProperty('parent', null);
      expect(category).toHaveProperty('children', []);
    });

    it('Создание категории с ошибкой', async () => {
      await request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${accessTokenAdmin}`)
        // Должно быть более 3-х букв
        .send({ name: '?' })
        .expect(400);
    });
  });

  describe('Обновление категорий', () => {
    let categoryId: string;

    // Перед тестом
    beforeAll(async () => {
      // Тестовая категория для обновления
      const response = await request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${accessTokenAdmin}`)
        .send({ name: 'Обнови меня' })
        .expect(201);
      categoryId = (response.body as responseCategory).id;
    });

    it('Обновить имя категории', async () => {
      const newName = 'А меня обновили';
      const response = await request(server)
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessTokenAdmin}`)
        .send({ name: newName })
        .expect(200);

      expect(response.body).toHaveProperty('id', categoryId);
      expect(response.body).toHaveProperty('name', newName);
    });

    it('Обновление несуществующей категории', async () => {
      await request(server)
        .patch(`/categories/1234567890987654321`)
        .set('Authorization', `Bearer ${accessTokenAdmin}`)
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('Удаление категории', () => {
    let categoryId: string;

    beforeEach(async () => {
      // Тестовая категория для удаления
      const response = await request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${accessTokenAdmin}`)
        .send({ name: 'Меня нужно удалить' })
        .expect(201);
      categoryId = (response.body as responseCategory).id;
    });

    it('Удаление категории', async () => {
      await request(server)
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessTokenAdmin}`)
        .expect(200);

      await request(server).get(`/categories/${categoryId}`).expect(404);
    });

    it('Удаление несуществующей категории', async () => {
      await request(server)
        .delete('/categories/1234567890987654321')
        .set('Authorization', `Bearer ${accessTokenAdmin}`)
        .expect(404);
    });
  });
});
