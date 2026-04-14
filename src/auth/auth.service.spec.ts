import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { jwtConfig, TJwtConfig } from 'src/config/jwt.config';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/common/enums/role.enum';

const createUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-id',
  name: 'Иван',
  email: 'ivan@example.com',
  password: 'salt:hash',
  about: '',
  birthdate: null,
  city: '',
  gender: undefined as never,
  avatar: '',
  role: Role.USER,
  refreshToken: null,
  skills: [],
  wantToLearn: [],
  favoriteSkills: [],
  sentRequests: [],
  receivedRequests: [],
  ...overrides,
});

type UsersRepositoryMock = Partial<
  Record<keyof Repository<User>, jest.Mock>
> & {
  create: jest.Mock;
  save: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
};

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: UsersRepositoryMock;
  let jwtService: { signAsync: jest.Mock };

  const jwtSettings: TJwtConfig = {
    secret: 'access-secret',
    expiresIn: '15m',
    refreshSecret: 'refresh-secret',
    refreshExpiresIn: '7d',
  };

  beforeEach(async () => {
    usersRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: jwtConfig.KEY,
          useValue: jwtSettings,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('сервис должен определяться', () => {
    expect(service).toBeDefined();
  });

  it('register должен хешировать пароль, сохранять пользователя и возвращать токены', async () => {
    const dto = {
      name: 'Иван',
      email: 'ivan@example.com',
      password: 'StrongPass1!',
      birthdate: new Date('2000-05-20'),
      about: '',
      avatar: '',
      gender: undefined as never,
    };

    const createdUser = createUser({
      email: dto.email,
      password: 'hashed-password',
      birthdate: dto.birthdate,
    });
    const savedUser = createUser({
      id: 'new-user-id',
      email: dto.email,
      password: 'hashed-password',
      birthdate: dto.birthdate,
    });

    jest
      .spyOn(service as any, 'hashData')
      .mockResolvedValueOnce('hashed-password')
      .mockResolvedValueOnce('hashed-refresh-token');

    usersRepository.create.mockReturnValue(createdUser);
    usersRepository.save.mockResolvedValue(savedUser);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    usersRepository.update.mockResolvedValue({ affected: 1 });

    await expect(service.register(dto)).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(usersRepository.create).toHaveBeenCalledWith({
      ...dto,
      birthdate: dto.birthdate,
      password: 'hashed-password',
    });
    expect(usersRepository.save).toHaveBeenCalledWith(createdUser);
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      { sub: 'new-user-id', email: dto.email },
      {
        secret: jwtSettings.secret,
        expiresIn: jwtSettings.expiresIn,
      },
    );
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { sub: 'new-user-id', email: dto.email },
      {
        secret: jwtSettings.refreshSecret,
        expiresIn: jwtSettings.refreshExpiresIn,
      },
    );
    expect(usersRepository.update).toHaveBeenCalledWith('new-user-id', {
      refreshToken: 'hashed-refresh-token',
    });
  });

  it('login должен выбрасывать UnauthorizedException, если пользователь не найден', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'StrongPass1!',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('login должен выбрасывать UnauthorizedException, если пароль неверный', async () => {
    usersRepository.findOne.mockResolvedValue(createUser());
    jest.spyOn(service as any, 'verifyData').mockResolvedValue(false);

    await expect(
      service.login({
        email: 'ivan@example.com',
        password: 'WrongPass1!',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('login должен возвращать токены при валидных данных', async () => {
    const user = createUser();

    usersRepository.findOne.mockResolvedValue(user);
    jest
      .spyOn(service as any, 'verifyData')
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);
    jest
      .spyOn(service as any, 'hashData')
      .mockResolvedValue('hashed-refresh-token');
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    usersRepository.update.mockResolvedValue({ affected: 1 });

    await expect(
      service.login({
        email: user.email,
        password: 'StrongPass1!',
      }),
    ).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { email: user.email },
    });
    expect(usersRepository.update).toHaveBeenCalledWith(user.id, {
      refreshToken: 'hashed-refresh-token',
    });
  });

  it('logout должен очищать refresh token', async () => {
    usersRepository.update.mockResolvedValue({ affected: 1 });

    await expect(service.logout('user-id')).resolves.toEqual({
      message: 'Выход выполнен успешно',
    });

    expect(usersRepository.update).toHaveBeenCalledWith('user-id', {
      refreshToken: null,
    });
  });

  it('refreshTokens должен выбрасывать UnauthorizedException, если refresh token невалиден', async () => {
    usersRepository.findOne.mockResolvedValue(
      createUser({ refreshToken: 'stored-refresh-token' }),
    );
    jest.spyOn(service as any, 'verifyData').mockResolvedValue(false);

    await expect(
      service.refreshTokens('user-id', 'ivan@example.com', 'bad-refresh-token'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshTokens должен возвращать новую пару токенов', async () => {
    usersRepository.findOne.mockResolvedValue(
      createUser({ refreshToken: 'stored-refresh-token' }),
    );
    jest
      .spyOn(service as any, 'verifyData')
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);
    jest
      .spyOn(service as any, 'hashData')
      .mockResolvedValue('hashed-refresh-token');
    jwtService.signAsync
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');
    usersRepository.update.mockResolvedValue({ affected: 1 });

    await expect(
      service.refreshTokens(
        'user-id',
        'ivan@example.com',
        'valid-refresh-token',
      ),
    ).resolves.toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'user-id' },
    });
    expect(usersRepository.update).toHaveBeenCalledWith('user-id', {
      refreshToken: 'hashed-refresh-token',
    });
  });
});
