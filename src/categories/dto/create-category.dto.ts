import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCategoryDto {

  @IsString()
  @MinLength(3)
  @MaxLength(250)
  name: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}