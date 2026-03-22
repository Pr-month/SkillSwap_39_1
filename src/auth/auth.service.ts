import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';

import { User } from 'src/entities/user.entities';
import { jwtConfig } from 'src/config/jwt.config';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtSettings: ConfigType<typeof jwtConfig>,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await this.hashData(registerDto.password);

    const user = this.usersRepository.create({
      ...registerDto,
      birthdate: registerDto.birthdate
        ? new Date(registerDto.birthdate)
        : null,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);

    const tokens = await this.generateTokens(savedUser.id, savedUser.email);
    await this.updateRefreshToken(savedUser.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.usersRepository.update(userId, {
      refreshToken: null,
    });

    return { message: 'Выход выполнен успешно' };
  }

  async refreshTokens(userId: string, email: string, refreshToken: string) {
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

    const tokens = await this.generateTokens(userId, email);
    await this.updateRefreshToken(userId, tokens.refreshToken);

    return tokens;
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.jwtSettings.secret,
        expiresIn: this.jwtSettings.expiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.jwtSettings.refreshSecret,
        expiresIn: this.jwtSettings.refreshExpiresIn,
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
}
