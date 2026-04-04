import { DataSource } from 'typeorm';
import { City } from '../cities/entities/city.entity';
import { seedCitiesData } from './city-data.seed';
import { seedCities } from './city.seed';

type CityRepositoryMock = {
  findOne: jest.Mock<Promise<City | null>, [unknown]>;
  create: jest.Mock<City, [{ name: string }]>;
  save: jest.Mock<Promise<City>, [City]>;
};

describe('seedCities', () => {
  let cityRepository: CityRepositoryMock;
  let dataSource: DataSource;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    cityRepository = {
      findOne: jest.fn<Promise<City | null>, [unknown]>(),
      create: jest.fn<City, [{ name: string }]>((city) => ({
        id: 'city-id',
        ...city,
      })),
      save: jest.fn<Promise<City>, [City]>((city) => Promise.resolve(city)),
    };

    dataSource = {
      getRepository: jest.fn(() => cityRepository),
    } as unknown as DataSource;
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('должен добавлять только те города, которых еще нет в базе', async () => {
    cityRepository.findOne.mockImplementation(
      ({ where }: { where: { name: string } }) =>
        Promise.resolve(
          where.name === 'Москва'
            ? ({
                id: 'existing-city-id',
                name: 'Москва',
              } as City)
            : null,
        ),
    );

    await seedCities(dataSource);

    expect(cityRepository.findOne).toHaveBeenCalledTimes(seedCitiesData.length);
    expect(cityRepository.save).toHaveBeenCalledTimes(
      seedCitiesData.length - 1,
    );
  });
});
