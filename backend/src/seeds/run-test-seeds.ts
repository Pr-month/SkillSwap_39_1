/**
 * Seeds для тестов
 */
import { DataSource } from 'typeorm';
import { dbConfig } from '../config/db.config';
import { seedCities } from './city.seed';
import { seedUsers } from './user.seed';
import { seedAdmin } from './admin.seed';
import { seedSkills } from './skills.seed';
import { seedCategories } from './seed-category';

export async function runAllSeeds() {
  console.log('Запуск сидинга');
  console.log('Загрузка тестовых данных');

  const dataSource = new DataSource(dbConfig());

  try {
    await dataSource.initialize();
    console.log('Подключение к БД установлено');

    // Очистка Базы данных
    await dataSource.synchronize(true);
    console.log('База данных очищена');

    await seedCategories(dataSource);
    await seedCities(dataSource);
    await seedUsers(dataSource);
    await seedAdmin(dataSource);
    await seedSkills(dataSource);

    console.log('Данные для теста загружены');
  } finally {
    // проверяем если initialize упадет
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Сидинг завершен');
    }
  }
}

runAllSeeds().catch((error) => {
  console.error('Ошибка при загрузке тестовых данных:', error);
  process.exit(1);
});
