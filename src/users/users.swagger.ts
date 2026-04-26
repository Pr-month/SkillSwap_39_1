import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

class UsersMetaSwaggerDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 0 })
  skip: number;

  @ApiProperty({ example: 10 })
  take: number;

  @ApiProperty({ example: 24 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiProperty({ example: false })
  hasPrev: boolean;
}

class FindAllUsersResponseSwaggerDto {
  @ApiProperty({
    type: () => [ResponseUserDto],
  })
  data: ResponseUserDto[];

  @ApiProperty({
    type: () => UsersMetaSwaggerDto,
  })
  meta: UsersMetaSwaggerDto;
}

class UpdatePasswordResponseSwaggerDto {
  @ApiProperty({
    example: 'Пароль успешно обновлен',
  })
  message: string;
}

function ApiUsersProtected() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Требуется access token в заголовке Authorization',
    }),
  );
}

export function ApiUsersController() {
  return applyDecorators(ApiTags('Users'));
}

export function ApiUsersCreate() {
  return applyDecorators(
    ApiOperation({
      summary: 'Создать пользователя',
      description:
        'Метод пока является заглушкой. CreateUserDto сейчас не содержит полей и возвращается строковый ответ.',
    }),
    ApiBody({ type: CreateUserDto }),
    ApiCreatedResponse({
      description: 'Текущий заглушечный ответ метода',
      schema: {
        type: 'string',
        example: 'Создание пользователя',
      },
    }),
    ApiBadRequestResponse({
      description:
        'Тело запроса должно быть пустым, так как CreateUserDto пока не содержит полей',
    }),
  );
}

export function ApiUsersFindAll() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить список пользователей' }),
    ApiOkResponse({
      description: 'Список пользователей с пагинацией',
      type: FindAllUsersResponseSwaggerDto,
    }),
    ApiNotFoundResponse({
      description: 'Страница пользователей не найдена',
    }),
  );
}

export function ApiUsersFindMe() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить профиль текущего пользователя' }),
    ApiUsersProtected(),
    ApiOkResponse({
      description: 'Профиль текущего пользователя',
      type: ResponseUserDto,
    }),
    ApiBadRequestResponse({
      description: 'Некорректный id',
    }),
    ApiNotFoundResponse({
      description: 'Пользователь не найден',
    }),
  );
}

export function ApiUsersUpdateMyPassword() {
  return applyDecorators(
    ApiOperation({ summary: 'Обновить пароль текущего пользователя' }),
    ApiUsersProtected(),
    ApiBody({ type: UpdatePasswordDto }),
    ApiOkResponse({
      description: 'Пароль успешно обновлен',
      type: UpdatePasswordResponseSwaggerDto,
    }),
    ApiBadRequestResponse({
      description:
        'Текущий пароль указан неверно или новый пароль совпадает с текущим',
    }),
    ApiNotFoundResponse({
      description: 'Пользователь не найден',
    }),
  );
}

export function ApiUsersUpdateMe() {
  return applyDecorators(
    ApiOperation({
      summary: 'Обновить профиль текущего пользователя',
      description:
        'Метод подключен, но UpdateUserDto пока не содержит полей, поэтому сейчас swagger отражает пустое тело запроса.',
    }),
    ApiUsersProtected(),
    ApiBody({ type: UpdateUserDto }),
    ApiOkResponse({
      description: 'Профиль пользователя',
      type: ResponseUserDto,
    }),
    ApiBadRequestResponse({
      description:
        'Тело запроса должно быть пустым, так как UpdateUserDto пока не содержит полей',
    }),
    ApiNotFoundResponse({
      description: 'Пользователь не найден в базе данных',
    }),
  );
}
