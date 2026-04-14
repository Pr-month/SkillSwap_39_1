import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';

type CitiesRepositoryMock = Partial<Record<keyof Repository<City>, jest.Mock>> & {
  find: jest.Mock;
};

describe('CitiesService', () => {
  let service: CitiesService;
  let citiesRepository: CitiesRepositoryMock;

  beforeEach(async () => {
    citiesRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        {
          provide: getRepositoryToken(City),
          useValue: citiesRepository,
        },
      ],
    }).compile();

    service = module.get<CitiesService>(CitiesService);
  });

  it('сервис должен определяться', () => {
    expect(service).toBeDefined();
  });

  it('findAll должен возвращать до 10 городов без поиска', async () => {
    const cities = [{ id: '1', name: 'Москва' }];

    citiesRepository.find.mockResolvedValue(cities);

    await expect(service.findAll({})).resolves.toEqual(cities);
    expect(citiesRepository.find).toHaveBeenCalledWith({
      where: undefined,
      order: {
        name: 'ASC',
      },
      take: 10,
    });
  });

  it('findAll должен искать города по названию и возвращать максимум 10 результатов', async () => {
    const cities = [{ id: '2', name: 'Санкт-Петербург' }];

    citiesRepository.find.mockResolvedValue(cities);

    await expect(service.findAll({ search: 'Петер' })).resolves.toEqual(cities);
    expect(citiesRepository.find).toHaveBeenCalledWith({
      where: {
        name: ILike('%Петер%'),
      },
      order: {
        name: 'ASC',
      },
      take: 10,
    });
  });

  it('findAll должен игнорировать пустой поисковый запрос', async () => {
    citiesRepository.find.mockResolvedValue([]);

    await service.findAll({ search: '   ' });

    expect(citiesRepository.find).toHaveBeenCalledWith({
      where: undefined,
      order: {
        name: 'ASC',
      },
      take: 10,
    });
  });
});
