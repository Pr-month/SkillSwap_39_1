import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

class CategoryResponseSwaggerDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    example: 'Программирование',
    maxLength: 200,
  })
  name: string;

  @ApiProperty({
    example: null,
    format: 'uuid',
    nullable: true,
  })
  parentId: string | null;
}

class CategoryChildResponseSwaggerDto extends CategoryResponseSwaggerDto {}

class CategoryTreeResponseSwaggerDto extends CategoryResponseSwaggerDto {
  @ApiProperty({
    type: () => [CategoryChildResponseSwaggerDto],
    example: [
      {
        id: '660e8400-e29b-41d4-a716-446655440000',
        name: 'Frontend',
        parentId: '550e8400-e29b-41d4-a716-446655440000',
      },
    ],
  })
  children: CategoryChildResponseSwaggerDto[];
}

class CreateCategoryBodySwaggerDto {
  @ApiProperty({
    example: 'Программирование',
    minLength: 3,
    maxLength: 255,
  })
  name: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    required: false,
  })
  parentId?: string;
}

class UpdateCategoryBodySwaggerDto {
  @ApiProperty({
    example: 'Разработка',
    minLength: 3,
    maxLength: 255,
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: null,
    format: 'uuid',
    required: false,
    nullable: true,
    description:
      'UUID родительской категории. Передайте null, чтобы сделать категорию корневой',
  })
  parentId?: string | null;
}

class DeleteCategoryResponseSwaggerDto {
  @ApiProperty({
    example: 'Категория "Программирование" успешно удалена',
  })
  message: string;
}

function ApiCategoryIdParam() {
  return applyDecorators(
    ApiParam({
      name: 'id',
      description: 'UUID категории',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
  );
}

function ApiAdminCategoryProtected() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Требуется access token в заголовке Authorization',
    }),
    ApiForbiddenResponse({
      description: 'Доступ разрешен только пользователю с ролью ADMIN',
    }),
  );
}

export function ApiCategoriesController() {
  return applyDecorators(ApiTags('Categories'));
}

export function ApiCategoriesCreate() {
  return applyDecorators(
    ApiOperation({
      summary: 'Создать категорию',
      description: 'Доступно только администратору',
    }),
    ApiAdminCategoryProtected(),
    ApiBody({ type: CreateCategoryBodySwaggerDto }),
    ApiCreatedResponse({
      description: 'Категория успешно создана',
      type: CategoryResponseSwaggerDto,
    }),
    ApiBadRequestResponse({ description: 'Некорректные данные категории' }),
    ApiConflictResponse({
      description: 'Категория с таким названием уже существует',
    }),
    ApiNotFoundResponse({
      description: 'Указанная родительская категория не найдена',
    }),
  );
}

export function ApiCategoriesFindAll() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получить список категорий',
      description:
        'Возвращает корневые категории вместе с дочерними категориями',
    }),
    ApiOkResponse({
      description: 'Список категорий',
      type: CategoryTreeResponseSwaggerDto,
      isArray: true,
    }),
  );
}

export function ApiCategoriesFindOne() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить категорию по id' }),
    ApiCategoryIdParam(),
    ApiOkResponse({
      description: 'Категория получена',
      schema: {
        type: 'string',
        example:
          'Получение категории с id 550e8400-e29b-41d4-a716-446655440000',
      },
    }),
  );
}

export function ApiCategoriesUpdate() {
  return applyDecorators(
    ApiOperation({
      summary: 'Обновить категорию',
      description: 'Доступно только администратору',
    }),
    ApiCategoryIdParam(),
    ApiAdminCategoryProtected(),
    ApiBody({ type: UpdateCategoryBodySwaggerDto }),
    ApiOkResponse({
      description: 'Категория успешно обновлена',
      type: CategoryResponseSwaggerDto,
    }),
    ApiBadRequestResponse({
      description:
        'Некорректные данные или категория назначена сама себе родителем',
    }),
    ApiConflictResponse({
      description: 'Название категории уже занято',
    }),
    ApiNotFoundResponse({
      description: 'Категория или родительская категория не найдена',
    }),
  );
}

export function ApiCategoriesRemove() {
  return applyDecorators(
    ApiOperation({
      summary: 'Удалить категорию',
      description: 'Доступно только администратору',
    }),
    ApiCategoryIdParam(),
    ApiAdminCategoryProtected(),
    ApiOkResponse({
      description: 'Категория успешно удалена',
      type: DeleteCategoryResponseSwaggerDto,
    }),
    ApiNotFoundResponse({
      description: 'Категория для удаления не найдена',
    }),
  );
}
