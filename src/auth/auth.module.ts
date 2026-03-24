import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { StringValue } from 'ms';
import { jwtConfig, TJwtConfig } from '../config/jwt.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-access.guard';
import { JwtStrategy } from './strategies/jwt-access.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [jwtConfig.KEY],
      useFactory: (config: TJwtConfig) => ({
        secret: config.secret,
        signOptions: { expiresIn: config.expiresIn as StringValue },
      }),
    }),
    TypeOrmModule.forFeature([User])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RefreshTokenStrategy],
  exports: [JwtModule, JwtAuthGuard],
})
export class AuthModule {}
