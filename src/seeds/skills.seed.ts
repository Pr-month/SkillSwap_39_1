/**
 * Модуль для создания навыков
 */

import { DataSource } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { Skill } from '../skills/entities/skill.entity';
import { seedCategoryData } from './seed-category.data';

/**
 * Создание навыков
 * @param dataSource - база данных
 */
export async function seedSkills(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const skillRepository = dataSource.getRepository(Skill);

  // Проверить навыки, а вдруг уже есть?
  const countSkills = await skillRepository.count();
  if (countSkills) {
    console.log(
      `Таблица навыков уже содержит данные в количестве: ${countSkills}, создание навыков пропущено.`,
    );
    return;
  }

  // Проверить пользователей
  const users = await userRepository.find({
    where: { role: Role.USER },
  });

  if (!users.length) {
    console.log('Пользователей нет в базе данных, создание навыков пропущено.');
    return;
  }

  // Для статистики
  let countCreated = 0;

  // Собирать навыки в массив
  const skills: string[] = seedCategoryData.flatMap(
    (category) => category.children,
  );

  for (const skillName of skills) {
    const user = users[Math.floor(Math.random() * users.length)];

    const skill = new Skill();
    skill.title = skillName;
    skill.owner = user;
    skill.description = '';
    skill.images = [];

    await skillRepository.save(skill);
    countCreated = countCreated + 1;
    console.log(`Создан навык: "${skillName}"`);
  }

  console.log(`Таблица навыков создана. Всего: ${countCreated}`);
}
