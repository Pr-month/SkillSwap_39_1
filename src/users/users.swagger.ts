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
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Gender } from '../common/enums/gender.enum';
import { Role } from '../common/enums/role.enum';

class UserResponseSwaggerDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    example: 'Анна Иванова',
  })
  name: string;

  @ApiProperty({
    example: 'anna@example.com',
  })
  email: string;

  @ApiProperty({
    example: 'Люблю обмениваться навыками и учиться новому',
    nullable: true,
    required: false,
  })
  about?: string | null;

  @ApiProperty({
    example: '1998-05-20',
    format: 'date',
    nullable: true,
    required: false,
  })
  birthdate?: string | null;

  @ApiProperty({
    example: 'Москва',
    nullable: true,
    required: false,
  })
  city?: string | null;

  @ApiProperty({
    enum: Gender,
    example: Gender.FEMALE,
    nullable: true,
    required: false,
  })
  gender?: Gender | null;

  @ApiProperty({
    example: 'https://example.com/avatar.png',
    nullable: true,
    required: false,
  })
  avatar?: string | null;

  @ApiProperty({
    enum: Role,
    example: Role.USER,
  })
  role: Role;
}

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
    type: () => [UserResponseSwaggerDto],
  })
  data: UserResponseSwaggerDto[];

  @ApiProperty({
    type: () => UsersMetaSwaggerDto,
  })
  meta: UsersMetaSwaggerDto;
}

class UpdatePasswordBodySwaggerDto {
  @ApiProperty({
    example: 'OldP@ssw0rd',
    maxLength: 255,
  })
  currentPassword: string;

  @ApiProperty({
    example: 'NewP@ssw0rd',
    maxLength: 255,
  })
  newPassword: string;
}

class UpdatePasswordResponseSwaggerDto {
  @ApiProperty({
    example: 'Пароль успешно обновлен',
  })
  message: string;
}

function ApiUsersPaginationQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      example: 1,
      description: 'Номер страницы',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      example: 10,
      description: 'Количество элементов на странице, максимум 50',
    }),
  );
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
    ApiBody({
      schema: {
        type: 'object',
        properties: {},
      },
    }),
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
    ApiUsersPaginationQuery(),
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
      type: UserResponseSwaggerDto,
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
    ApiBody({ type: UpdatePasswordBodySwaggerDto }),
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
    ApiBody({
      schema: {
        type: 'object',
        properties: {},
      },
    }),
    ApiOkResponse({
      description: 'Профиль пользователя',
      type: UserResponseSwaggerDto,
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
