import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

class AuthTokensResponseSwaggerDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token-example.signature',
  })
  accessToken: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token-example.signature',
  })
  refreshToken: string;
}

class LogoutResponseSwaggerDto {
  @ApiProperty({ example: 'Выход выполнен успешно' })
  message: string;
}

function ApiRefreshTokenProtected() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description:
        'Требуется корректный refresh token в заголовке Authorization',
    }),
  );
}

export function ApiAuthController() {
  return applyDecorators(ApiTags('Auth'));
}

export function ApiAuthRegister() {
  return applyDecorators(
    ApiOperation({ summary: 'Регистрация пользователя' }),
    ApiBody({ type: RegisterDto }),
    ApiCreatedResponse({
      description: 'Пользователь успешно зарегистрирован',
      type: AuthTokensResponseSwaggerDto,
    }),
    ApiBadRequestResponse({
      description: 'Некорректные данные для регистрации',
    }),
  );
}

export function ApiAuthLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Вход пользователя' }),
    ApiBody({ type: LoginDto }),
    ApiOkResponse({
      description: 'Успешная авторизация',
      type: AuthTokensResponseSwaggerDto,
    }),
    ApiBadRequestResponse({ description: 'Некорректные данные для входа' }),
    ApiUnauthorizedResponse({ description: 'Неверный email или пароль' }),
  );
}

export function ApiAuthLogout() {
  return applyDecorators(
    ApiOperation({
      summary: 'Выход пользователя',
      description:
        'Для выхода передайте refresh token в заголовке Authorization: Bearer <token>',
    }),
    ApiRefreshTokenProtected(),
    ApiOkResponse({
      description: 'Пользователь успешно вышел из системы',
      type: LogoutResponseSwaggerDto,
    }),
  );
}

export function ApiAuthRefresh() {
  return applyDecorators(
    ApiOperation({
      summary: 'Обновление access и refresh токенов',
      description:
        'Для обновления передайте refresh token в заголовке Authorization: Bearer <token>',
    }),
    ApiRefreshTokenProtected(),
    ApiOkResponse({
      description: 'Токены успешно обновлены',
      type: AuthTokensResponseSwaggerDto,
    }),
  );
}
