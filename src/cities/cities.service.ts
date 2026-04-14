import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCityDto } from './dto/create-city.dto';
import { GetCitiesQueryDto } from './dto/get-cities-query.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { ILike, Repository } from 'typeorm';
import { City } from './entities/city.entity';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly citiesRepository: Repository<City>,
  ) {}

  create(createCityDto: CreateCityDto) {
    void createCityDto;
    return 'Создание города';
  }

  async findAll(query: GetCitiesQueryDto) {
    const search = query.search?.trim();

    return this.citiesRepository.find({
      where: search
        ? {
            name: ILike(`%${search}%`),
          }
        : undefined,
      order: {
        name: 'ASC',
      },
      take: 10,
    });
  }

  findOne(id: string) {
    return `Получение города с id ${id}`;
  }

  update(id: string, updateCityDto: UpdateCityDto) {
    void updateCityDto;
    return `Обновление города с id ${id}`;
  }

  remove(id: string) {
    return `Удаление города с id ${id}`;
  }
}
