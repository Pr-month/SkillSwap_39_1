import { ConflictException, Inject, Injectable } from '@nestjs/common';
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
    const hashedRefreshToken = await this.hashData(tokens.refreshToken);

    await this.usersRepository.update(savedUser.id, {
      refreshToken: hashedRefreshToken,
    });

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
}
