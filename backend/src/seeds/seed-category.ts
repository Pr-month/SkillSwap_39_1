import { DataSource } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { seedCategoryData } from './seed-category.data';

export async function seedCategories(dataSource: DataSource) {
  console.log('Добавление категорий...');
  const categoryRepository = dataSource.getRepository(Category);

  let created = 0;

  for (const categoryData of seedCategoryData) {
    let parentCategory = await categoryRepository.findOne({
      where: { name: categoryData.name },
    });

    if (!parentCategory) {
      parentCategory = categoryRepository.create({
        name: categoryData.name,
        parentId: null,
      });
      await categoryRepository.save(parentCategory);
      console.log(`Добавлена родительская категория: ${categoryData.name}`);
      created++;
    } else {
      console.log(`Родительская категория ${categoryData.name} уже существует`);
    }

    if (categoryData.children && categoryData.children.length > 0) {
      console.log(`Добавление дочерних категорий для "${categoryData.name}":`);

      for (const childName of categoryData.children) {
        const existingChild = await categoryRepository.findOne({
          where: {
            name: childName,
            parentId: parentCategory.id,
          },
        });

        if (!existingChild) {
          const childCategory = categoryRepository.create({
            name: childName,
            parentId: parentCategory.id,
          });
          await categoryRepository.save(childCategory);
          console.log(
            `Добавлена дочерняя категория: ${childName} к родительской ${categoryData.name}`,
          );
          created++;
        } else {
          console.log(
            `Дочерняя категория ${childName} уже существует у родительской ${categoryData.name}`,
          );
        }
      }
    }
  }

  console.log(`Всего добавлено ${created} категорий`);
}
