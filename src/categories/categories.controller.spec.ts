import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
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

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let categoriesService: {
    findAll: jest.Mock<Promise<Category[]>, []>;
  };

  beforeEach(async () => {
    categoriesService = {
      findAll: jest.fn<Promise<Category[]>, []>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: categoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('контроллер должен определяться', () => {
    expect(controller).toBeDefined();
  });

  it('должен возвращать список корневых категорий с подкатегориями', async () => {
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

    categoriesService.findAll.mockResolvedValue(categories);

    await expect(controller.findAll()).resolves.toEqual(categories);
    expect(categoriesService.findAll).toHaveBeenCalledTimes(1);
  });
});
