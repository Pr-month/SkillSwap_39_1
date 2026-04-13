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
import { Transform } from 'class-transformer';
import { Gender } from '../../common/enums/gender.enum';
import { normalizeString } from '../../common/utils';

export class RegisterDto {
  // Имя пользователя
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  // Почта
  @IsEmail()
  @MaxLength(255)
  email: string;

  // Пароль
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
  @IsDate()
  @MinDate(new Date(1900, 0, 1))
  @MaxDate(() => new Date())
  birthdate: Date;

  // Город
  @IsString()
  @IsOptional()
  @Transform(({ value }) => normalizeString(String(value)))
  @MaxLength(100)
  city?: string;

  // Пол
  @IsEnum(Gender)
  @IsOptional()
  gender: Gender;

  // Информация о пользователе
  @IsString()
  @IsOptional()
  @Transform(({ value }) => normalizeString(String(value)))
  @MaxLength(255)
  about: string;

  // Аватар
  @IsString()
  @IsOptional()
  @MaxLength(255)
  avatar: string;

  // Категория, которой пользователь хочет обучиться
  @IsUUID()
  categoryId: string;
}
