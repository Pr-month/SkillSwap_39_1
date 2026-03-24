import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entities';
import { UsersService } from './users.service';
import { hashPassword, verifyPassword } from './utils/password.util';

type UsersRepositoryMock = {
  findOne: jest.Mock<Promise<User | null>, [unknown]>;
  save: jest.Mock<Promise<User>, [User]>;
};

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: UsersRepositoryMock;

  beforeEach(async () => {
    usersRepository = {
      findOne: jest.fn<Promise<User | null>, [unknown]>(),
      save: jest.fn<Promise<User>, [User]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('сервис должен определяться', () => {
    expect(service).toBeDefined();
  });

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
