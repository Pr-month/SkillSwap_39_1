/**
 * Модуль e2e тестов для файлов
 */
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as path from 'path';
import { App } from 'supertest/types';
import * as http from 'http';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from 'src/app.module';
import { AllExceptionFilter } from 'src/common/filters/all-exception.filter';

describe('Тест e2e для файлов', () => {
  let app: INestApplication<App>;
  let server: http.Server;

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
  });

  // После теста, прибраться
  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Загрузка файла', () => {
    it('Загрузка изображения', async () => {
      const response = await request(server)
        .post('/files/upload')
        .attach('file', path.resolve(__dirname, 'test_file', 'test.png'))
        .expect(201);

      expect(typeof response.text).toBe('string');
      expect(response.text).toContain('/public/');
    });

    it('Загрузка тестового файла. Ответ 400', async () => {
      await request(server)
        .post('/files/upload')
        .attach('file', path.resolve(__dirname, 'test_file', 'test.txt'))
        .expect(400);
    });
  });
});
