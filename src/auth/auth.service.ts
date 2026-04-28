import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { jwtConfig, TJwtConfig } from '../config/jwt.config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { StringValue } from 'ms';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtSettings: TJwtConfig,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const hashedPassword = await this.hashData(registerDto.password);

      const category = await this.categoriesRepository.findOne({
        where: { id: registerDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Категория не найдена');
      }

      const user = this.usersRepository.create({
        name: registerDto.name,
        email: registerDto.email,
        birthdate: registerDto.birthdate
          ? new Date(registerDto.birthdate)
          : null,
        city: registerDto.city,
        gender: registerDto.gender,
        about: registerDto.about,
        avatar: registerDto.avatar,
        password: hashedPassword,
        wantToLearn: [category],
      });

      const savedUser = await this.usersRepository.save(user);

      const tokens = await this.generateTokens(
        savedUser.id,
        savedUser.email,
        savedUser.role,
      );
      await this.updateRefreshToken(savedUser.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      if (this.isDatabaseErrorWithCode(error, '23505')) {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await this.verifyData(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.usersRepository.update(userId, {
      refreshToken: null,
    });

    return { message: 'Выход выполнен успешно' };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Доступ запрещен');
    }

    const isRefreshTokenValid = await this.verifyData(
      refreshToken,
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Неверный refresh token');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(userId, tokens.refreshToken);

    return tokens;
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: User['role'],
  ) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.jwtSettings.secret,
        expiresIn: this.jwtSettings.expiresIn as StringValue,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.jwtSettings.refreshSecret,
        expiresIn: this.jwtSettings.refreshExpiresIn as StringValue,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);

    await this.usersRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  private async hashData(data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString('hex');

      crypto.scrypt(data, salt, 64, (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(`${salt}:${derivedKey.toString('hex')}`);
      });
    });
  }

  private async verifyData(data: string, hashedData: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [salt, originalHash] = hashedData.split(':');

      crypto.scrypt(data, salt, 64, (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(originalHash === derivedKey.toString('hex'));
      });
    });
  }

  private isDatabaseErrorWithCode(
    error: unknown,
    code: string,
  ): error is { code: string } {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return false;
    }

    return error.code === code;
  }
}
