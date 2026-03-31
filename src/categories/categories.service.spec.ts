import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindManyOptions } from 'typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

const createCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 'category-id',
  name: 'Музыкальные инструменты',
  parentId: null,
  parent: null,
  children: [],
  skills: [],
  ...overrides,
});

type CategoriesRepositoryMock = {
  find: jest.Mock<Promise<Category[]>, [FindManyOptions<Category>]>;
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoriesRepository: CategoriesRepositoryMock;

  beforeEach(async () => {
    categoriesRepository = {
      find: jest.fn<Promise<Category[]>, [FindManyOptions<Category>]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: categoriesRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('сервис должен определяться', () => {
    expect(service).toBeDefined();
  });

  it('должен возвращать только корневые категории вместе с children', async () => {
    const categories = [
      createCategory({
        children: [
          createCategory({
            id: 'child-id',
            name: 'Игра на барабанах',
            parentId: 'category-id',
          }),
        ],
      }),
    ];

    categoriesRepository.find.mockResolvedValue(categories);

    await expect(service.findAll()).resolves.toEqual(categories);
    expect(categoriesRepository.find).toHaveBeenCalledTimes(1);

    const findOptions = categoriesRepository.find.mock.calls[0][0];

    expect(findOptions.relations).toEqual({
      children: true,
    });
    expect(findOptions.order).toEqual({
      name: 'ASC',
      children: {
        name: 'ASC',
      },
    });
    expect(findOptions.where).toBeDefined();
    expect(Array.isArray(findOptions.where)).toBe(false);

    if (!findOptions.where || Array.isArray(findOptions.where)) {
      throw new Error('Фильтр категорий должен быть объектом');
    }

    expect(findOptions.where).toHaveProperty('parentId');
  });
});
