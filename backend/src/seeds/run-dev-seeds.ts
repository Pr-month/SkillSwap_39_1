import { DataSource } from 'typeorm';
import { dbConfig } from '../config/db.config';
import { seedCities } from './city.seed';
import { seedUsers } from './user.seed';
import { seedAdmin } from './admin.seed';
import { seedSkills } from './skills.seed';
import { seedCategories } from './seed-category';

export async function runAllSeeds() {
  console.log('Запуск dev-сидинга');
  console.log('Загрузка демо-данных для локальной разработки');

  const dataSource = new DataSource(dbConfig());

  try {
    await dataSource.initialize();
    console.log('Подключение к БД установлено');

    await seedCategories(dataSource);
    await seedCities(dataSource);
    await seedUsers(dataSource);
    await seedAdmin(dataSource);
    await seedSkills(dataSource);

    console.log('Демо-данные успешно загружены');
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Сидинг завершен');
    }
  }
}

runAllSeeds().catch((error) => {
  console.error('Ошибка при загрузке демо-данных:', error);
  process.exit(1);
});
