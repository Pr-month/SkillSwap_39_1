import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdatePasswordDto } from './dto/update-password.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: { updateMyPassword: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            updateMyPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  it('контроллер должен определяться', () => {
    expect(controller).toBeDefined();
  });

  it('должен передавать смену пароля текущего пользователя в сервис', async () => {
    const dto: UpdatePasswordDto = {
      currentPassword: 'old-password',
      newPassword: 'new-password',
    };
    usersService.updateMyPassword.mockResolvedValue({
      message: 'Пароль успешно обновлен',
    });

    await expect(
      controller.updateMyPassword(
        {
          user: {
            sub: 'user-id',
            email: 'user@example.com',
            role: 'USER',
          },
        } as never,
        dto,
      ),
    ).resolves.toEqual({
      message: 'Пароль успешно обновлен',
    });

    expect(usersService.updateMyPassword).toHaveBeenCalledWith('user-id', dto);
  });
});
