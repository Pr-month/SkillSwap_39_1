import { Test, TestingModule } from '@nestjs/testing';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';

describe('CitiesController', () => {
  let controller: CitiesController;
  let citiesService: {
    findAll: jest.Mock;
    create: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    citiesService = {
      findAll: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitiesController],
      providers: [
        {
          provide: CitiesService,
          useValue: citiesService,
        },
      ],
    }).compile();

    controller = module.get<CitiesController>(CitiesController);
  });

  it('контроллер должен определяться', () => {
    expect(controller).toBeDefined();
  });

  it('findAll должен передавать query в сервис', async () => {
    const query = { search: 'Моск' };
    const cities = [{ id: '1', name: 'Москва' }];

    citiesService.findAll.mockResolvedValue(cities);

    await expect(controller.findAll(query)).resolves.toEqual(cities);
    expect(citiesService.findAll).toHaveBeenCalledWith(query);
  });
});
