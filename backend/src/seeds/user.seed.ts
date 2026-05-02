import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { seedUsersData } from './user-data.seed';
import { hashSeedPassword } from './seed-password.util';

export async function seedUsers(dataSource: DataSource) {
  console.log('Добавление пользователей...');

  const userRepository = dataSource.getRepository(User);
  const categoryRepository = dataSource.getRepository(Category);

  const hashedPassword = await hashSeedPassword('123456');
  const categories = (
    await categoryRepository.find({
      relations: ['parent'],
    })
  ).filter((category) => Boolean(category.parentId));

  let created = 0;
  let updated = 0;

  for (const [index, userData] of seedUsersData.entries()) {
    const wantToLearn = categories.length
      ? [
          categories[index % categories.length],
          categories[(index + 1) % categories.length],
        ].filter(
          (category, categoryIndex, categoryList) =>
            categoryList.findIndex(
              (currentCategory) => currentCategory.id === category.id,
            ) === categoryIndex,
        )
      : [];

    const exists = await userRepository.findOne({
      where: { email: userData.email },
      relations: ['wantToLearn'],
    });

    if (!exists) {
      const user = userRepository.create({
        ...userData,
        password: hashedPassword,
        wantToLearn,
      });
      await userRepository.save(user);
      console.log(
        `Добавлен пользователь: ${userData.name} (${userData.email})`,
      );
      created++;
    } else {
      let shouldUpdate = false;

      if (!exists.avatar && userData.avatar) {
        exists.avatar = userData.avatar;
        shouldUpdate = true;
      }

      if (
        (!exists.wantToLearn || exists.wantToLearn.length === 0) &&
        wantToLearn.length
      ) {
        exists.wantToLearn = wantToLearn;
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        await userRepository.save(exists);
        console.log(`Пользователь ${userData.email} обновлен демо-данными`);
        updated++;
        continue;
      }

      console.log(`Пользователь ${userData.email} уже существует`);
    }
  }

  console.log(`Добавлено пользователей: ${created}`);
  console.log(`Обновлено пользователей: ${updated}`);
}
