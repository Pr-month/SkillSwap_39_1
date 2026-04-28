import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RequestStatus } from '../common/enums/request-status.enum';

class RequestUserPreviewSwaggerDto {
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
}

class RequestSkillPreviewSwaggerDto {
  @ApiProperty({
    example: '660e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    example: 'Frontend-разработка',
  })
  title: string;

  @ApiProperty({
    example: 'Создание современных пользовательских интерфейсов',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: ['/file_1712876543210_k8a1bc2d3e.png'],
    type: [String],
    nullable: true,
  })
  images: string[] | null;
}

class RequestBaseSwaggerDto {
  @ApiProperty({
    example: '770e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    example: '2026-04-12T10:15:30.000Z',
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  senderId: string;

  @ApiProperty({
    example: '880e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  receiverId: string;

  @ApiProperty({
    enum: RequestStatus,
    example: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @ApiProperty({
    example: '990e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    nullable: true,
  })
  offeredSkillId: string | null;

  @ApiProperty({
    example: 'aa0e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    nullable: true,
  })
  requestedSkillId: string | null;

  @ApiProperty({
    example: false,
  })
  isRead: boolean;
}

class OutgoingRequestItemSwaggerDto extends RequestBaseSwaggerDto {
  @ApiProperty({
    type: () => RequestUserPreviewSwaggerDto,
  })
  receiver: RequestUserPreviewSwaggerDto;

  @ApiProperty({
    type: () => RequestSkillPreviewSwaggerDto,
    nullable: true,
  })
  offeredSkill: RequestSkillPreviewSwaggerDto | null;

  @ApiProperty({
    type: () => RequestSkillPreviewSwaggerDto,
  })
  requestedSkill: RequestSkillPreviewSwaggerDto;
}

class IncomingRequestItemSwaggerDto extends RequestBaseSwaggerDto {
  @ApiProperty({
    type: () => RequestUserPreviewSwaggerDto,
  })
  sender: RequestUserPreviewSwaggerDto;

  @ApiProperty({
    type: () => RequestSkillPreviewSwaggerDto,
    nullable: true,
  })
  offeredSkill: RequestSkillPreviewSwaggerDto | null;

  @ApiProperty({
    type: () => RequestSkillPreviewSwaggerDto,
  })
  requestedSkill: RequestSkillPreviewSwaggerDto;
}

class RequestsPaginationSwaggerDto {
  @ApiProperty({
    example: 1,
  })
  page: number;

  @ApiProperty({
    example: 10,
  })
  limit: number;

  @ApiProperty({
    example: 25,
  })
  total: number;

  @ApiProperty({
    example: 3,
  })
  totalPage: number;
}

class FindOutgoingRequestsResponseSwaggerDto {
  @ApiProperty({
    type: () => [OutgoingRequestItemSwaggerDto],
  })
  data: OutgoingRequestItemSwaggerDto[];

  @ApiProperty({
    type: () => RequestsPaginationSwaggerDto,
  })
  pagination: RequestsPaginationSwaggerDto;
}

class FindIncomingRequestsResponseSwaggerDto {
  @ApiProperty({
    type: () => [IncomingRequestItemSwaggerDto],
  })
  data: IncomingRequestItemSwaggerDto[];

  @ApiProperty({
    type: () => RequestsPaginationSwaggerDto,
  })
  pagination: RequestsPaginationSwaggerDto;
}

class CreateRequestBodySwaggerDto {
  @ApiProperty({
    example: 'aa0e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  requestedSkillId: string;

  @ApiProperty({
    example: '990e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    required: false,
  })
  offeredSkillId?: string;
}

class UpdateRequestBodySwaggerDto {
  @ApiProperty({
    enum: RequestStatus,
    example: RequestStatus.ACCEPTED,
  })
  status: RequestStatus;
}

class RequestMutationResponseSwaggerDto extends RequestBaseSwaggerDto {}

class DeleteRequestResponseSwaggerDto {
  @ApiProperty({
    example: 'Заявка успешно удалена',
  })
  message: string;
}

function ApiRequestsPaginationQuery() {
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
      description: 'Количество элементов на странице, максимум 100',
    }),
  );
}

function ApiRequestIdParam() {
  return applyDecorators(
    ApiParam({
      name: 'id',
      description: 'UUID заявки',
      example: '770e8400-e29b-41d4-a716-446655440000',
    }),
  );
}

export function ApiRequestsController() {
  return applyDecorators(
    ApiTags('Requests'),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Требуется access token в заголовке Authorization',
    }),
  );
}

export function ApiRequestsFindOutgoing() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получить исходящие заявки текущего пользователя',
    }),
    ApiRequestsPaginationQuery(),
    ApiOkResponse({
      description: 'Список исходящих заявок',
      type: FindOutgoingRequestsResponseSwaggerDto,
    }),
    ApiNotFoundResponse({
      description: 'Пользователь или исходящие заявки не найдены',
    }),
  );
}

export function ApiRequestsFindIncoming() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить входящие заявки текущего пользователя' }),
    ApiRequestsPaginationQuery(),
    ApiOkResponse({
      description: 'Список входящих заявок',
      type: FindIncomingRequestsResponseSwaggerDto,
    }),
    ApiNotFoundResponse({
      description: 'Пользователь или входящие заявки не найдены',
    }),
  );
}

export function ApiRequestsCreate() {
  return applyDecorators(
    ApiOperation({ summary: 'Создать заявку на обмен навыками' }),
    ApiBody({ type: CreateRequestBodySwaggerDto }),
    ApiCreatedResponse({
      description: 'Заявка успешно создана',
      type: RequestMutationResponseSwaggerDto,
    }),
    ApiBadRequestResponse({
      description:
        'Нельзя отправить заявку самому себе или переданы некорректные данные',
    }),
    ApiNotFoundResponse({
      description: 'Запрашиваемый или предлагаемый навык не найден',
    }),
  );
}

export function ApiRequestsUpdate() {
  return applyDecorators(
    ApiOperation({ summary: 'Обновить статус заявки' }),
    ApiRequestIdParam(),
    ApiBody({ type: UpdateRequestBodySwaggerDto }),
    ApiOkResponse({
      description: 'Статус заявки успешно обновлен',
      type: RequestMutationResponseSwaggerDto,
    }),
    ApiForbiddenResponse({
      description: 'Можно обновить только входящую заявку',
    }),
    ApiNotFoundResponse({
      description: 'Заявка не найдена',
    }),
  );
}

export function ApiRequestsRemove() {
  return applyDecorators(
    ApiOperation({ summary: 'Удалить заявку' }),
    ApiRequestIdParam(),
    ApiOkResponse({
      description: 'Заявка успешно удалена',
      type: DeleteRequestResponseSwaggerDto,
    }),
    ApiForbiddenResponse({
      description:
        'Удалить можно только отправленную заявку или это может сделать ADMIN',
    }),
    ApiNotFoundResponse({
      description: 'Заявка или пользователь не найдены',
    }),
  );
}
