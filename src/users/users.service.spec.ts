import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { hashPassword, verifyPassword } from './utils/password.util';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { Gender } from '../common/enums/gender.enum';
import { Role } from '../common/enums/role.enum';
import { Category } from '../categories/entities/category.entity';

type UsersRepositoryMock = {
  findOne: jest.Mock<Promise<User | null>, [unknown]>;
  save: jest.Mock<Promise<User>, [User]>;
  count: jest.Mock<Promise<number>, [unknown?]>;
  find: jest.Mock<Promise<User[]>, [unknown]>;
  update: jest.Mock<Promise<any>, [string, Partial<User>]>;
};

type CategoriesRepositoryMock = {
  findOne: jest.Mock<Promise<Category | null>, [unknown]>;
};

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: UsersRepositoryMock;
  let categoriesRepository: CategoriesRepositoryMock;

  const mockUsers = [
    {
      id: '1',
      name: 'test',
      email: 'test@yand.ru',
      about: 'test about',
      city: 'city',
      gender: Gender.FEMALE,
      avatar: 'test.jpg',
      role: Role.USER,
      wantToLearn: [],
    },
    {
      id: '2',
      name: 'test2',
      email: 'test2@yand.ru',
      about: 'test about 2',
      city: 'town',
      gender: Gender.MALE,
      avatar: 'test22.jpg',
      role: Role.USER,
      wantToLearn: [],
    },
  ] as unknown as User[];

  beforeEach(async () => {
    usersRepository = {
      findOne: jest.fn<Promise<User | null>, [unknown]>(),
      save: jest.fn<Promise<User>, [User]>(),
      count: jest.fn<Promise<number>, [unknown?]>(),
      find: jest.fn<Promise<User[]>, [unknown]>(),
      update: jest.fn<Promise<any>, [string, Partial<User>]>(),
    };

    categoriesRepository = {
      findOne: jest.fn<Promise<Category | null>, [unknown]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: categoriesRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('сервис должен определяться', () => {
    expect(service).toBeDefined();
  });

  it('проверка метода create', () => {
    const createUser: CreateUserDto = { name: 'Test', email: 'test@yandex.ru' };
    const expectRes = 'Создание пользователя';

    const result = service.create(createUser);

    expect(result).toBe(expectRes);
  });

  describe('проверка метода findAll', () => {
    const mockTotal = 20;

    it('проверка успешного ответа', async () => {
      usersRepository.count.mockResolvedValue(mockTotal);
      usersRepository.find.mockResolvedValue(mockUsers);

      const paginationData: GetUsersQueryDto = { page: 2, limit: 10 };
      const expectedResMeta = {
        page: paginationData.page,
        limit: paginationData.limit,
        skip: (paginationData.page - 1) * paginationData.limit,
        take: paginationData.limit,
        total: mockTotal,
        totalPages: mockTotal / paginationData.limit,
        hasNext: paginationData.page < mockTotal / paginationData.limit,
        hasPrev: paginationData.page > 1,
      };

      const result = await service.findAll(paginationData);

      expect(result.data).toEqual(mockUsers);
      expect(result.meta).toEqual(expectedResMeta);

      expect(usersRepository.count).toHaveBeenCalledWith({ where: {} });
      expect(usersRepository.find).toHaveBeenCalledWith({
        where: {},
        skip: (paginationData.page - 1) * paginationData.limit,
        take: paginationData.limit,
        order: { name: 'ASC' },
      });
    });

    it('проверка успешного ответа с параметрами пагинации по умолчанию', async () => {
      usersRepository.count.mockResolvedValue(mockTotal);
      usersRepository.find.mockResolvedValue(mockUsers);

      const expectedResMeta = {
        page: 1,
        limit: 10,
        skip: 0,
        take: 10,
        total: mockTotal,
        totalPages: mockTotal / 10,
        hasNext: 1 < mockTotal / 10,
        hasPrev: false,
      };

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockUsers);
      expect(result.meta).toEqual(expectedResMeta);

      expect(usersRepository.count).toHaveBeenCalledWith({ where: {} });
      expect(usersRepository.find).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        order: { name: 'ASC' },
      });
    });

    it('проверка ошибки при запросе несуществующей страницы', async () => {
      usersRepository.count.mockResolvedValue(mockTotal);
      usersRepository.find.mockResolvedValue(mockUsers);

      const paginationData: GetUsersQueryDto = { page: 3, limit: 10 };

      await expect(service.findAll(paginationData)).rejects.toThrow(
        NotFoundException,
      );

      expect(usersRepository.find).not.toHaveBeenCalled();
    });

    it('проверка ошибки при отсутствии записей в БД', async () => {
      usersRepository.count.mockResolvedValue(0);
      usersRepository.find.mockResolvedValue([]);

      const result = await service.findAll({ page: 1, limit: 2 });

      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({
        page: 1,
        limit: 2,
        skip: 0,
        take: 2,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    });
  });

  describe('проверка метода findOne', () => {
    it('проверка успешного ответа', async () => {
      usersRepository.findOne.mockResolvedValue(mockUsers[0]);

      const result = await service.findOne('1');

      expect(result).toEqual(mockUsers[0]);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('проверка ошибки при некорректном id', async () => {
      await expect(service.findOne('  ')).rejects.toThrow(BadRequestException);

      expect(usersRepository.findOne).not.toHaveBeenCalled();
    });

    it('проверка ошибки при поиске несуществующего пользователя', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('проверка метода update', () => {
    const mockUpdateUser = { name: 'updatedTest' };

    it('проверка успешного обновления данных', async () => {
      const storedUser = {
        ...mockUsers[0],
        wantToLearn: [],
      } as User;

      usersRepository.findOne
        .mockResolvedValueOnce(storedUser)
        .mockResolvedValueOnce({
          ...storedUser,
          name: mockUpdateUser.name,
        } as User);
      usersRepository.save.mockImplementation((entity: User) =>
        Promise.resolve(entity),
      );

      const result = await service.update('1', mockUpdateUser);

      expect(result).toEqual({ ...storedUser, name: mockUpdateUser.name });
      expect(usersRepository.save).toHaveBeenCalledWith({
        ...storedUser,
        name: mockUpdateUser.name,
      });
      expect(usersRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: '1' },
        relations: ['wantToLearn'],
      });
      expect(usersRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: '1' },
      });
    });

    it('проверка ошибки при попытке обновления несуществующего пользователя', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.update('1', mockUpdateUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(usersRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('проверка метода updateMyPassword', () => {
    it('должен обновлять пароль и очищать refresh token', async () => {
      const storedPassword = await hashPassword('old-password');
      const user = {
        id: 'user-id',
        password: storedPassword,
        refreshToken: 'refresh-token',
      } as User;

      usersRepository.findOne.mockResolvedValue(user);
      usersRepository.save.mockImplementation((entity: User) =>
        Promise.resolve(entity),
      );

      await expect(
        service.updateMyPassword('user-id', {
          currentPassword: 'old-password',
          newPassword: 'new-password',
        }),
      ).resolves.toEqual({
        message: 'Пароль успешно обновлен',
      });

      expect(user.refreshToken).toBeNull();
      await expect(verifyPassword('new-password', user.password)).resolves.toBe(
        true,
      );
      expect(usersRepository.save).toHaveBeenCalledWith(user);
    });

    it('должен выбрасывать ошибку, если пользователь не найден', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateMyPassword('missing-user', {
          currentPassword: 'old-password',
          newPassword: 'new-password',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('должен выбрасывать ошибку, если текущий пароль указан неверно', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 'user-id',
        password: await hashPassword('old-password'),
        refreshToken: 'refresh-token',
      } as User);

      await expect(
        service.updateMyPassword('user-id', {
          currentPassword: 'wrong-password',
          newPassword: 'new-password',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('должен выбрасывать ошибку, если новый пароль совпадает с текущим', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 'user-id',
        password: await hashPassword('same-password'),
        refreshToken: 'refresh-token',
      } as User);

      await expect(
        service.updateMyPassword('user-id', {
          currentPassword: 'same-password',
          newPassword: 'same-password',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
