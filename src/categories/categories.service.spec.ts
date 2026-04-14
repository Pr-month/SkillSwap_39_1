import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindManyOptions, IsNull, Repository } from 'typeorm';
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

type CategoriesRepositoryMock = Partial<
  Record<keyof Repository<Category>, jest.Mock>
> & {
  find: jest.Mock<Promise<Category[]>, [FindManyOptions<Category>]>;
  findOneBy: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  remove: jest.Mock;
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoriesRepository: CategoriesRepositoryMock;

  beforeEach(async () => {
    categoriesRepository = {
      find: jest.fn<Promise<Category[]>, [FindManyOptions<Category>]>(),
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
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

  it('create должен создавать категорию без родителя', async () => {
    const dto = { name: 'Спорт' };
    const createdCategory = createCategory({ name: dto.name });

    categoriesRepository.findOneBy
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    categoriesRepository.create.mockReturnValue(createdCategory);
    categoriesRepository.save.mockResolvedValue(createdCategory);

    await expect(service.create(dto)).resolves.toEqual(createdCategory);

    expect(categoriesRepository.findOneBy).toHaveBeenNthCalledWith(1, {
      name: dto.name,
    });
    expect(categoriesRepository.create).toHaveBeenCalledWith({
      name: dto.name,
      parent: null,
      parentId: null,
    });
    expect(categoriesRepository.save).toHaveBeenCalledWith(createdCategory);
  });

  it('create должен выбрасывать ConflictException, если имя занято', async () => {
    categoriesRepository.findOneBy.mockResolvedValue(createCategory());

    await expect(
      service.create({ name: 'Музыкальные инструменты' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('create должен выбрасывать NotFoundException, если parentId не найден', async () => {
    categoriesRepository.findOneBy
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    await expect(
      service.create({ name: 'Гитара', parentId: 'missing-parent-id' }),
    ).rejects.toBeInstanceOf(NotFoundException);
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
    expect(findOptions.where).toEqual({
      parentId: IsNull(),
    });
  });

  it('update должен менять имя категории', async () => {
    const category = createCategory();
    const updatedCategory = createCategory({ name: 'Танцы' });

    categoriesRepository.findOne.mockResolvedValue(category);
    categoriesRepository.findOneBy.mockResolvedValue(null);
    categoriesRepository.save.mockResolvedValue(updatedCategory);

    await expect(service.update('category-id', { name: 'Танцы' })).resolves.toEqual(
      updatedCategory,
    );

    expect(categoriesRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'category-id' },
      relations: ['parent'],
    });
    expect(categoriesRepository.findOneBy).toHaveBeenCalledWith({
      name: 'Танцы',
    });
    expect(categoriesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Танцы' }),
    );
  });

  it('update должен выбрасывать NotFoundException, если категория не найдена', async () => {
    categoriesRepository.findOne.mockResolvedValue(null);

    await expect(service.update('missing-id', { name: 'Танцы' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update должен выбрасывать BadRequestException, если категория назначает себя родителем', async () => {
    categoriesRepository.findOne.mockResolvedValue(createCategory());

    await expect(
      service.update('category-id', { parentId: 'category-id' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('update должен выбрасывать NotFoundException, если новый родитель не найден', async () => {
    categoriesRepository.findOne.mockResolvedValue(createCategory());
    categoriesRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.update('category-id', { parentId: 'missing-parent-id' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove должен удалять категорию и возвращать сообщение', async () => {
    const category = createCategory();

    categoriesRepository.findOneBy.mockResolvedValue(category);
    categoriesRepository.remove.mockResolvedValue(category);

    await expect(service.remove('category-id')).resolves.toEqual({
      message: 'Категория "Музыкальные инструменты" успешно удалена',
    });

    expect(categoriesRepository.remove).toHaveBeenCalledWith(category);
  });

  it('remove должен выбрасывать NotFoundException, если категория не найдена', async () => {
    categoriesRepository.findOneBy.mockResolvedValue(null);

    await expect(service.remove('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
