/**
 * Модуль для DTO (Data Transfer Object) для для категорий
 */
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { normalizeString } from '../../common/utils';

export class CreateCategoryDto {
  // Название категории
  @ApiProperty({
    example: 'Программирование',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @Transform(({ value }) => normalizeString(String(value)))
  @MinLength(3)
  @MaxLength(255)
  name: string;

  // Родитель категории
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    required: false,
    nullable: true,
    description:
      'UUID родительской категории. Для корневой категории поле можно не передавать',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}
