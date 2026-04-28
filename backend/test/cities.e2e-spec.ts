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
import { AllExceptionFilter } from 'src/common/filters/all-exception.filter';
import { City } from 'src/cities/entities/city.entity';

type CityResponse = {
  id: string;
  name: string;
};

type ErrorResponse = {
  message: string | string[];
  statusCode: number;
};

function getTypedBody<T>(response: Response): T {
  return response.body as T;
}

jest.setTimeout(20000);

describe('Тест e2e для cities', () => {
  let app: INestApplication<App>;
  let server: http.Server;
  let dataSource: DataSource;
  let citiesRepository: Repository<City>;

  beforeAll(async () => {
    const moduleApp: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleApp.createNestApplication();
    dataSource = moduleApp.get(DataSource);
    citiesRepository = dataSource.getRepository(City);

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
    await citiesRepository.clear();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /cities должен возвращать не больше 10 городов в алфавитном порядке', async () => {
    await citiesRepository.save([
      { name: 'Tula' },
      { name: 'Arkhangelsk' },
      { name: 'Yaroslavl' },
      { name: 'Moscow' },
      { name: 'Kaluga' },
      { name: 'Bryansk' },
      { name: 'Omsk' },
      { name: 'Samara' },
      { name: 'Voronezh' },
      { name: 'Perm' },
      { name: 'Kazan' },
      { name: 'Belgorod' },
    ]);

    const response = await request(server).get('/cities').expect(200);
    const body = getTypedBody<CityResponse[]>(response);

    expect(body).toHaveLength(10);
    expect(body.map((city) => city.name)).toEqual([
      'Arkhangelsk',
      'Belgorod',
      'Bryansk',
      'Kaluga',
      'Kazan',
      'Moscow',
      'Omsk',
      'Perm',
      'Samara',
      'Tula',
    ]);
  });

  it('GET /cities должен фильтровать города по query search без учета регистра и лишних пробелов', async () => {
    await citiesRepository.save([
      { name: 'Moscow' },
      { name: 'Monaco' },
      { name: 'Tver' },
      { name: 'Smolensk' },
    ]);

    const response = await request(server)
      .get('/cities')
      .query({ search: '  mo  ' })
      .expect(200);
    const body = getTypedBody<CityResponse[]>(response);

    expect(body.map((city) => city.name)).toEqual([
      'Monaco',
      'Moscow',
      'Smolensk',
    ]);
  });

  it('GET /cities должен возвращать 400 при слишком длинном query search', async () => {
    const response = await request(server)
      .get('/cities')
      .query({ search: 'а'.repeat(151) })
      .expect(400);
    const body = getTypedBody<ErrorResponse>(response);

    expect(body.statusCode).toBe(400);
    expect(body.message).toContain(
      'search must be shorter than or equal to 150 characters',
    );
  });
});
