import { DataSource } from 'typeorm';
import { dbConfig } from '../config/db.config';
import { seedUsers } from './user.seed';
import { seedCategories } from './seed-category';

export async function runAllSeeds() {
  console.log('Запуск сидинга');

  const dataSource = new DataSource(dbConfig());

  try {
    await dataSource.initialize();
    console.log('Подключение к БД установлено');
    await seedCategories(dataSource);
    await seedUsers(dataSource);

  } finally {
    // проверяем если initialize упадет
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Сидинг завершен');
    }
  }
}

runAllSeeds().catch((error) => {
  console.error('Ошибка:', error);
  process.exit(1);
});
