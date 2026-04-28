import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { UploadFileDto } from './dto/upload-file.dto';

class UploadFileResponseSwaggerDto {
  @ApiProperty({
    example: 'Файл успешно загружен',
  })
  message: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    example: 'file_1712876543210_k8a1bc2d3e.png',
  })
  filename: string;

  @ApiProperty({
    example: 'avatar.png',
  })
  originalName: string;

  @ApiProperty({
    example: 145678,
  })
  size: number;

  @ApiProperty({
    example: 'image/png',
  })
  mimetype: string;

  @ApiProperty({
    example: '/file_1712876543210_k8a1bc2d3e.png',
  })
  url: string;
}

export function ApiFilesController() {
  return applyDecorators(ApiTags('Files'));
}

export function ApiFilesUpload() {
  return applyDecorators(
    ApiOperation({
      summary: 'Загрузить файл',
      description:
        'Принимает изображение в формате multipart/form-data. Разрешены: PNG, JPG, JPEG, GIF, SVG, WEBP. Максимальный размер файла: 2 MB.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: UploadFileDto }),
    ApiOkResponse({
      description: 'Файл успешно загружен',
      type: UploadFileResponseSwaggerDto,
    }),
    ApiBadRequestResponse({
      description:
        'Файл не загружен, имеет неподдерживаемый формат или превышает лимит',
    }),
  );
}
