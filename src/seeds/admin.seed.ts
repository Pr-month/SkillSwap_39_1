/**
 * Модуль для создания Администратора
 */

import { DataSource } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { seedAdminData } from './admin-data.seed';
import { hashPassword } from '../users/utils/password.util';

/**
 *
 * @param dataSource - база данных
 */
export async function seedAdmin(dataSource: DataSource) {
  console.log('Добавление Администратора...');

  // Администратор
  const adminPassword: string = 'Admin_404';

  const userRepository = dataSource.getRepository(User);

  // Поиск Администратора в БД
  const existingAdmin = await userRepository.findOne({
    where: { email: seedAdminData.email },
  });

  // Уже есть?
  if (existingAdmin) {
    console.log('Администратор в БД уже есть.');
    return;
  }

  // Создание в БД Администратора
  const hashedPassword = await hashPassword(adminPassword);
  const admin = userRepository.create({
    ...seedAdminData,
    password: hashedPassword,
  });
  await userRepository.save(admin);

  console.log('Администратор создан');
}
