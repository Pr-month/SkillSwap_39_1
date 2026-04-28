import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Файл изображения для загрузки',
  })
  file: Express.Multer.File;
}
