/**
 * Модуль для DTO (Data Transfer Object) для авторизации
 */
import {
  IsString,
  IsEmail,
  IsDate,
  IsStrongPassword,
  IsEnum,
  MinDate,
  MaxDate,
  MinLength,
  MaxLength,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../common/enums/gender.enum';
import { normalizeString } from '../../common/utils';

export class RegisterDto {
  // Имя пользователя
  @ApiProperty({
    example: 'Анна Иванова',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  // Почта
  @ApiProperty({
    example: 'anna@example.com',
    maxLength: 255,
  })
  @IsEmail()
  @MaxLength(255)
  email: string;

  // Пароль
  @ApiProperty({
    example: 'StrongP@ssw0rd1',
    minLength: 8,
    maxLength: 50,
    description:
      'Пароль должен содержать заглавную, строчную букву, цифру и спецсимвол',
  })
  @IsStrongPassword({
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @MinLength(8)
  @MaxLength(50)
  password: string;

  // Дата рождения
  @ApiProperty({
    example: '1998-05-20T00:00:00.000Z',
    format: 'date-time',
  })
  @Type(() => Date)
  @IsDate()
  @MinDate(new Date(1900, 0, 1))
  @MaxDate(() => new Date())
  birthdate: Date;

  // Город
  @ApiProperty({
    example: 'Москва',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => normalizeString(String(value)))
  @MaxLength(100)
  city?: string;

  // Пол
  @ApiProperty({
    enum: Gender,
    example: Gender.FEMALE,
    required: false,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender: Gender;

  // Информация о пользователе
  @ApiProperty({
    example: 'Люблю учиться и делиться опытом',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => normalizeString(String(value)))
  @MaxLength(255)
  about: string;

  // Аватар
  @ApiProperty({
    example: 'https://example.com/avatar.png',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  avatar: string;

  // Категория, которой пользователь хочет обучиться
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  categoryId: string;
}
