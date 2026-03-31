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
import { normalizeString } from '../../common/utils';

export class CreateCategoryDto {
  // Название категории
  @IsString()
  @Transform(({ value }) => normalizeString(String(value)))
  @MinLength(3)
  @MaxLength(255)
  name: string;

  // Родитель категории
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
