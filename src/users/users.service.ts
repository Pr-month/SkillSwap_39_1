import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { hashPassword, verifyPassword } from './utils/password.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    void createUserDto;
    return 'Создание пользователя';
  }

  async findAll(queryDto: GetUsersQueryDto) {
    const { page = 1, limit = 10 } = queryDto;

    const skip = (page - 1) * limit;
    const take = limit;

    const [users, total] = await this.usersRepository.findAndCount({
      skip,
      take,
      order: {
        name: 'ASC',
      },
    });

    return {
      data: [...users],
      meta: {
        page,
        limit,
        skip,
        take,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string) {
    if (!id?.trim()) {
      throw new BadRequestException('Некорректный id');
    }

    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const result = await this.usersRepository.update(id, updateUserDto);

    if (!result.affected) {
      throw new NotFoundException('Пользователь не найден в базе данных');
    }

    return this.findOne(id);
  }

  async updateMyPassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        refreshToken: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isCurrentPasswordValid = await verifyPassword(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Текущий пароль указан неверно');
    }

    const isNewPasswordSame = await verifyPassword(
      updatePasswordDto.newPassword,
      user.password,
    );

    if (isNewPasswordSame) {
      throw new BadRequestException(
        'Новый пароль должен отличаться от текущего',
      );
    }

    user.password = await hashPassword(updatePasswordDto.newPassword);
    user.refreshToken = null;

    await this.usersRepository.save(user);

    return {
      message: 'Пароль успешно обновлен',
    };
  }
}
