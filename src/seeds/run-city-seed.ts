import { DataSource } from 'typeorm';
import { dbConfig } from '../config/db.config';
import { seedCities } from './city.seed';

export async function runCitySeed() {
  console.log('Запуск сидинга городов');

  const dataSource = new DataSource(dbConfig());

  try {
    await dataSource.initialize();
    console.log('Подключение к БД установлено');

    await seedCities(dataSource);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Сидинг городов завершен');
    }
  }
}

runCitySeed().catch((error) => {
  console.error('Ошибка:', error);
  process.exit(1);
});
