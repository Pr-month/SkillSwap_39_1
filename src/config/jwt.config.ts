/**
 * Конфигурация JWT
 */
import { registerAs, ConfigType } from '@nestjs/config';

export const jwtConfig = registerAs('JWT_CONFIG', () => ({
  secret: process.env.JWT_SECRET ?? 'example-top-secret-key-JWT',
  expiresIn: process.env.JWT_SECRET_EXPIRES ?? '10m',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'example-top-secret-key-JWT-refresh',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES ?? '10d',
}));

export type TJwtConfig = ConfigType<typeof jwtConfig>;
