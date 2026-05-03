/**
 * Модуль для создания навыков
 */

import { DataSource } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { Skill } from '../skills/entities/skill.entity';
import { Category } from '../categories/entities/category.entity';
import { seedCategoryData } from './seed-category.data';

/**
 * Создание навыков
 * @param dataSource - база данных
 */
export async function seedSkills(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const skillRepository = dataSource.getRepository(Skill);
  const categoryRepository = dataSource.getRepository(Category);

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
  let countUpdated = 0;

  const categories = await categoryRepository.find({
    relations: ['parent'],
  });

  // Собирать навыки в массив
  const skills = seedCategoryData.flatMap((category) =>
    category.children.map((childName) => ({
      title: childName,
      parentCategoryName: category.name,
    })),
  );

  for (const [index, skillDefinition] of skills.entries()) {
    const user = users[index % users.length];
    const category = categories.find(
      (currentCategory) =>
        currentCategory.name === skillDefinition.title &&
        currentCategory.parent?.name === skillDefinition.parentCategoryName,
    );

    if (!category) {
      console.log(`Категория для навыка "${skillDefinition.title}" не найдена`);
      continue;
    }

    const existingSkill = await skillRepository.findOne({
      where: { title: skillDefinition.title },
      relations: ['owner', 'category'],
    });

    if (existingSkill) {
      let shouldUpdate = false;

      if (!existingSkill.owner) {
        existingSkill.owner = user;
        shouldUpdate = true;
      }

      if (
        !existingSkill.category ||
        existingSkill.category.id !== category.id
      ) {
        existingSkill.category = category;
        shouldUpdate = true;
      }

      if (!existingSkill.images) {
        existingSkill.images = [];
        shouldUpdate = true;
      }

      if (existingSkill.description === null) {
        existingSkill.description = '';
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        await skillRepository.save(existingSkill);
        countUpdated++;
        console.log(`Навык "${skillDefinition.title}" обновлен`);
      }

      continue;
    }

    const skill = new Skill();
    skill.title = skillDefinition.title;
    skill.owner = user;
    skill.description = '';
    skill.images = [];
    skill.category = category;

    await skillRepository.save(skill);
    countCreated = countCreated + 1;
    console.log(`Создан навык: "${skillDefinition.title}"`);
  }

  console.log(`Таблица навыков создана. Всего: ${countCreated}`);
  console.log(`Навыков обновлено: ${countUpdated}`);
}
