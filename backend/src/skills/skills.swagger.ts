import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill-dto';

class SkillBaseSwaggerDto {
  @ApiProperty({
    example: '660e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    example: 'Frontend-разработка',
    maxLength: 200,
  })
  title: string;

  @ApiProperty({
    example: 'Создание современных пользовательских интерфейсов',
    nullable: true,
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    example: ['/file_1712876543210_k8a1bc2d3e.png'],
    type: [String],
    nullable: true,
    required: false,
  })
  images?: string[] | null;
}

class SkillCategoryPreviewSwaggerDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;
}

class SkillResponseSwaggerDto extends SkillBaseSwaggerDto {
  @ApiProperty({
    type: () => SkillCategoryPreviewSwaggerDto,
  })
  category: SkillCategoryPreviewSwaggerDto;
}

class SkillsMetaSwaggerDto {
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

class FindAllSkillsResponseSwaggerDto {
  @ApiProperty({
    type: () => [SkillBaseSwaggerDto],
  })
  data: SkillBaseSwaggerDto[];

  @ApiProperty({
    type: () => SkillsMetaSwaggerDto,
  })
  meta: SkillsMetaSwaggerDto;
}

class DeleteSkillResponseSwaggerDto {
  @ApiProperty({
    example: 'Skill deleted successfully',
  })
  message: string;
}

class FavoriteSkillPreviewSwaggerDto {
  @ApiProperty({
    example: '660e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    example: 'Frontend-разработка',
  })
  title: string;
}

class FavoriteSkillResponseSwaggerDto {
  @ApiProperty({
    example: 'Навык Frontend-разработка добавлен в избранное',
  })
  message: string;

  @ApiProperty({
    type: () => FavoriteSkillPreviewSwaggerDto,
  })
  skill: FavoriteSkillPreviewSwaggerDto;
}

function ApiSkillsIdParam() {
  return applyDecorators(
    ApiParam({
      name: 'id',
      description: 'UUID навыка',
      example: '660e8400-e29b-41d4-a716-446655440000',
    }),
  );
}

function ApiSkillFavoriteProtected() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Требуется access token в заголовке Authorization',
    }),
  );
}

export function ApiSkillsController() {
  return applyDecorators(ApiTags('Skills'));
}

export function ApiSkillsFindAll() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить список навыков' }),
    ApiOkResponse({
      description: 'Список навыков с пагинацией',
      type: FindAllSkillsResponseSwaggerDto,
    }),
    ApiNotFoundResponse({
      description: 'Страница навыков не найдена',
    }),
  );
}

export function ApiSkillsCreate() {
  return applyDecorators(
    ApiOperation({ summary: 'Создать навык' }),
    ApiBody({ type: CreateSkillDto }),
    ApiCreatedResponse({
      description: 'Навык успешно создан',
      type: SkillResponseSwaggerDto,
    }),
    ApiBadRequestResponse({
      description: 'Некорректные данные для создания навыка',
    }),
  );
}

export function ApiSkillsUpdate() {
  return applyDecorators(
    ApiOperation({ summary: 'Обновить навык' }),
    ApiSkillsIdParam(),
    ApiBody({ type: UpdateSkillDto }),
    ApiOkResponse({
      description: 'Навык успешно обновлен',
      type: SkillResponseSwaggerDto,
    }),
    ApiBadRequestResponse({
      description: 'Нет полей для обновления или переданы некорректные данные',
    }),
    ApiNotFoundResponse({
      description: 'Skill not found',
    }),
  );
}

export function ApiSkillsRemove() {
  return applyDecorators(
    ApiOperation({ summary: 'Удалить навык' }),
    ApiSkillsIdParam(),
    ApiOkResponse({
      description: 'Навык успешно удален',
      type: DeleteSkillResponseSwaggerDto,
    }),
    ApiNotFoundResponse({
      description: 'Skill not found',
    }),
  );
}

export function ApiSkillsRemoveFromFavorites() {
  return applyDecorators(
    ApiOperation({ summary: 'Удалить навык из избранного' }),
    ApiSkillsIdParam(),
    ApiSkillFavoriteProtected(),
    ApiOkResponse({
      description: 'Навык успешно удален из избранного',
      type: FavoriteSkillResponseSwaggerDto,
    }),
    ApiNotFoundResponse({
      description:
        'Навык не существует, пользователь не найден или навык отсутствует в избранном',
    }),
  );
}

export function ApiSkillsAddToFavorites() {
  return applyDecorators(
    ApiOperation({ summary: 'Добавить навык в избранное' }),
    ApiSkillsIdParam(),
    ApiSkillFavoriteProtected(),
    ApiOkResponse({
      description: 'Навык успешно добавлен в избранное',
      type: FavoriteSkillResponseSwaggerDto,
    }),
    ApiConflictResponse({
      description: 'Навык уже был добавлен в избранное ранее',
    }),
    ApiNotFoundResponse({
      description: 'Навык не существует или пользователь не найден',
    }),
  );
}
