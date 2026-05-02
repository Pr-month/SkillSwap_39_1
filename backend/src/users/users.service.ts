import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { hashPassword, verifyPassword } from './utils/password.util';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class UsersService {
  private readonly userRelations = [
    'skills',
    'skills.category',
    'skills.category.parent',
    'wantToLearn',
    'wantToLearn.parent',
  ] as const;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  create(createUserDto: CreateUserDto) {
    void createUserDto;
    return 'Создание пользователя';
  }

  async findAll(queryDto: GetUsersQueryDto) {
    const { page = 1, limit = 10, city, gender, name } = queryDto;

    const skip = (page - 1) * limit;
    const take = limit;

    const where = {
      ...(city ? { city: ILike(`%${city}%`) } : {}),
      ...(gender ? { gender } : {}),
      ...(name ? { name: ILike(`%${name}%`) } : {}),
    };

    const total = await this.usersRepository.count({ where });
    const totalPages = Math.ceil(total / limit);

    if (total > 0 && page > totalPages) {
      throw new NotFoundException('Страница пользователей не найдена');
    }

    const users = await this.usersRepository.find({
      where,
      relations: [...this.userRelations],
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
        totalPages,
        hasNext: page < totalPages,
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
      relations: [...this.userRelations],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['wantToLearn'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден в базе данных');
    }

    const { categoryId, birthdate, ...rest } = updateUserDto;

    Object.assign(user, rest);

    if (birthdate !== undefined) {
      user.birthdate = birthdate ? new Date(birthdate) : null;
    }

    if (categoryId !== undefined) {
      const category = await this.categoriesRepository.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundException('Категория не найдена');
      }

      user.wantToLearn = [category];
    }

    await this.usersRepository.save(user);

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
