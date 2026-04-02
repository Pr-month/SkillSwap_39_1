import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { hashPassword } from '../users/utils/password.util';
import { seedUsersData } from './user-data.seed';

export async function seedUsers(dataSource: DataSource) {
  console.log('Добавление пользователей...');

  const userRepository = dataSource.getRepository(User);

  const hashedPassword = await hashPassword('123456');

  let created = 0;

  for (const userData of seedUsersData) {
    const exists = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (!exists) {
      const user = userRepository.create({
        ...userData,
        password: hashedPassword,
      });
      await userRepository.save(user);
      console.log(
        `Добавлен пользователь: ${userData.name} (${userData.email})`,
      );
      created++;
    } else {
      console.log(`Пользователь ${userData.email} уже существует`);
    }
  }

  console.log(`Добавлено пользователей: ${created}`);
}
