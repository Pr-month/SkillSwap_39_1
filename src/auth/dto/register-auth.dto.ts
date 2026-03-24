/**
 * Модуль для DTO (Data Transfer Object) для авторизации
 */
import {
  IsString,
  IsEmail,
  IsDateString,
  IsStrongPassword,
  //IsEnum,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;      // Имя пользователя

  @IsEmail()
  email: string;     // Почта

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;    // Пароль

  // TODO: минимальная и максимальная дата
  @IsDateString()
  birthdate: Date;     // Дата рождения

  // TODO: пол должен быть перечислением
  @IsString()
  gender: string;      // Пол

  @IsString()
  city: string;        // Город

  @IsString()
  about: string;       // Информация о пользователе

  // TODO: аватар должен быть URL ???
  @IsString()
  avatar: string;      // аватар

  // TODO: навыки должны быть перечислением ???
  @IsString()
  skills: string;      // навыки, которые создал пользователь

  // TODO: навыки должны быть перечислением ???
  @IsString()
  wantToLearn: string; // навыки, которым пользователь хочет научиться)

  // TODO: навыки должны быть перечислением ???
  @IsString()
  favoriteSkills: string;  // навыки, которые пользователь добавил в избранное

  // TODO: роли должны быть перечислением
  @IsString()
  role: string;           // роль пользователя USER или ADMIN
}

/*
а) У пользователя должны быть поля

    • id,
    • name,
    • email,
    • password,
    • about (информация о пользователе),
    • birthdate (дата рождения),
    • city (город),
    • gender (пол),
    • avatar (ссылка на изображение)
    • skills (навыки, которые создал пользователь),
    • wantToLearn (Категории навыков, которым пользователь хочет научиться)
    • favoriteSkills (навыки, которые пользователь добавил в избранное),
    • role (роль пользователя USER или ADMIN)
    • refreshToken (токен в зашифрованном виде)
 */
