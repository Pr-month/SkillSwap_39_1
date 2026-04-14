import { DataSource } from 'typeorm';
import { City } from '../cities/entities/city.entity';
import { seedCitiesData } from './city-data.seed';

export async function seedCities(dataSource: DataSource) {
  console.log('Добавление городов...');

  const cityRepository = dataSource.getRepository(City);
  let created = 0;

  for (const cityData of seedCitiesData) {
    const exists = await cityRepository.findOne({
      where: { name: cityData.name },
    });

    if (!exists) {
      const city = cityRepository.create(cityData);

      await cityRepository.save(city);
      console.log(`Добавлен город: ${cityData.name}`);
      created++;
    } else {
      console.log(`Город ${cityData.name} уже существует`);
    }
  }

  console.log(`Добавлено городов: ${created}`);
}
