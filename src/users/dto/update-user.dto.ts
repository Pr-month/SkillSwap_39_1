import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Gender } from '../../common/enums/gender.enum';
import { normalizeString } from '../../common/utils';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Анна Иванова',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'anna@example.com',
    maxLength: 255,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    example: '1998-05-20',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @ApiPropertyOptional({
    example: 'Москва',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => normalizeString(String(value)))
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    enum: Gender,
    example: Gender.FEMALE,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    example: 'Люблю обмениваться навыками и учиться новому',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => normalizeString(String(value)))
  @MaxLength(255)
  about?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.png',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
