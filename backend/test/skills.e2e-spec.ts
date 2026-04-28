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
import { Category } from 'src/categories/entities/category.entity';
import { Gender } from 'src/common/enums/gender.enum';
import { Role } from 'src/common/enums/role.enum';
import { Skill } from 'src/skills/entities/skill.entity';
import { User } from 'src/users/entities/user.entity';

type SkillListItem = {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
};

type SkillsListResponse = {
  data: SkillListItem[];
  meta: {
    page: number;
    limit: number;
    skip: number;
    take: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

type SimilarUserResponse = {
  id: string;
  name: string;
  email: string;
};

type ErrorResponse = {
  message: string | string[];
  statusCode: number;
};

function getTypedBody<T>(response: Response): T {
  return response.body as T;
}

jest.setTimeout(20000);

describe('Тест e2e для skills', () => {
  let app: INestApplication<App>;
  let server: http.Server;
  let dataSource: DataSource;
  let categoryRepository: Repository<Category>;
  let skillRepository: Repository<Skill>;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleApp: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleApp.createNestApplication();
    dataSource = moduleApp.get(DataSource);
    categoryRepository = dataSource.getRepository(Category);
    skillRepository = dataSource.getRepository(Skill);
    userRepository = dataSource.getRepository(User);

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
  }): Promise<User> {
    const user = new User();

    user.name = params.name;
    user.email = params.email;
    user.password = 'seed-password';
    user.about = '';
    user.birthdate = null;
    user.city = '';
    user.gender = Gender.MALE;
    user.avatar = '';
    user.role = Role.USER;
    user.refreshToken = null;
    user.wantToLearn = [];
    user.favoriteSkills = [];
    user.skills = [];
    user.sentRequests = [];
    user.receivedRequests = [];

    return userRepository.save(user);
  }

  async function createCategory(name: string): Promise<Category> {
    const category = new Category();

    category.name = name;
    category.parentId = null;
    category.parent = null;
    category.children = [];
    category.skills = [];

    return categoryRepository.save(category);
  }

  async function createSkill(params: {
    title: string;
    description: string;
    owner: User;
    category: Category;
  }): Promise<Skill> {
    const skill = new Skill();

    skill.title = params.title;
    skill.description = params.description;
    skill.images = [];
    skill.owner = params.owner;
    skill.category = params.category;

    return skillRepository.save(skill);
  }

  it('GET /skills должен возвращать навыки с пагинацией, сортировкой и фильтрацией по categoryId и search', async () => {
    const frontendCategory = await createCategory('Frontend');
    const backendCategory = await createCategory('Backend');
    const owner = await createUser({
      name: 'Иван',
      email: 'ivan.skills@example.com',
    });

    await createSkill({
      title: 'React',
      description: 'Создание интерфейсов',
      owner,
      category: frontendCategory,
    });
    await createSkill({
      title: 'Angular',
      description: 'Фреймворк для SPA',
      owner,
      category: frontendCategory,
    });
    await createSkill({
      title: 'Node.js',
      description: 'Серверная разработка',
      owner,
      category: backendCategory,
    });

    const response = await request(server)
      .get('/skills')
      .query({
        page: 1,
        limit: 10,
        categoryId: frontendCategory.id,
        search: '  a  ',
      })
      .expect(200);
    const body = getTypedBody<SkillsListResponse>(response);

    expect(body.meta).toEqual({
      page: 1,
      limit: 10,
      skip: 0,
      take: 10,
      total: 2,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
    expect(body.data.map((skill) => skill.title)).toEqual(['Angular', 'React']);
    expect(
      body.data.every((skill) => skill.category.id === frontendCategory.id),
    ).toBe(true);
  });

  it('GET /skills/:id/similar должен возвращать пользователей с навыками из той же категории', async () => {
    const frontendCategory = await createCategory('Frontend');
    const designCategory = await createCategory('Design');
    const owner = await createUser({
      name: 'Владелец навыка',
      email: 'owner.skills@example.com',
    });
    const similarUser = await createUser({
      name: 'Похожий пользователь',
      email: 'similar.skills@example.com',
    });
    const differentUser = await createUser({
      name: 'Другой пользователь',
      email: 'different.skills@example.com',
    });

    const sourceSkill = await createSkill({
      title: 'React',
      description: 'Основы React',
      owner,
      category: frontendCategory,
    });
    await createSkill({
      title: 'Vue',
      description: 'Основы Vue',
      owner: similarUser,
      category: frontendCategory,
    });
    await createSkill({
      title: 'Figma',
      description: 'Дизайн интерфейсов',
      owner: differentUser,
      category: designCategory,
    });

    const response = await request(server)
      .get(`/skills/${sourceSkill.id}/similar`)
      .expect(200);
    const body = getTypedBody<SimilarUserResponse[]>(response);

    expect(body.map((user) => user.name)).toEqual(
      expect.arrayContaining([owner.name, similarUser.name]),
    );
    expect(body.map((user) => user.name)).not.toContain(differentUser.name);
  });

  it('GET /skills должен возвращать 400 при невалидном limit', async () => {
    const response = await request(server)
      .get('/skills')
      .query({ limit: 51 })
      .expect(400);
    const body = getTypedBody<ErrorResponse>(response);

    expect(body.statusCode).toBe(400);
    expect(body.message).toContain('limit must not be greater than 50');
  });
});
