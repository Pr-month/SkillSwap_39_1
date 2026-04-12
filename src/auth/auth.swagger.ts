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
import { Gender } from '../common/enums/gender.enum';

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

class RegisterBodySwaggerDto {
  @ApiProperty({
    example: 'Анна Иванова',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @ApiProperty({
    example: 'anna@example.com',
    maxLength: 255,
  })
  email: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd1',
    minLength: 8,
    maxLength: 50,
    description:
      'Пароль должен содержать заглавную, строчную букву, цифру и спецсимвол',
  })
  password: string;

  @ApiProperty({
    example: '1998-05-20T00:00:00.000Z',
    format: 'date-time',
  })
  birthdate: string;

  @ApiProperty({
    example: 'Москва',
    required: false,
    maxLength: 100,
  })
  city?: string;

  @ApiProperty({
    enum: Gender,
    example: Gender.FEMALE,
    required: false,
  })
  gender?: Gender;

  @ApiProperty({
    example: 'Люблю учиться и делиться опытом',
    required: false,
    maxLength: 255,
  })
  about?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.png',
    required: false,
    maxLength: 255,
  })
  avatar?: string;
}

class LoginBodySwaggerDto {
  @ApiProperty({
    example: 'anna@example.com',
    maxLength: 255,
  })
  email: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd1',
    minLength: 6,
    maxLength: 255,
  })
  password: string;
}

function ApiRefreshTokenProtected() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Требуется корректный refresh token в заголовке Authorization',
    }),
  );
}

export function ApiAuthController() {
  return applyDecorators(ApiTags('Auth'));
}

export function ApiAuthRegister() {
  return applyDecorators(
    ApiOperation({ summary: 'Регистрация пользователя' }),
    ApiBody({ type: RegisterBodySwaggerDto }),
    ApiCreatedResponse({
      description: 'Пользователь успешно зарегистрирован',
      type: AuthTokensResponseSwaggerDto,
    }),
    ApiBadRequestResponse({ description: 'Некорректные данные для регистрации' }),
  );
}

export function ApiAuthLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Вход пользователя' }),
    ApiBody({ type: LoginBodySwaggerDto }),
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
