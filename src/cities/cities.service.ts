import { Injectable } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  create(createCityDto: CreateCityDto) {
    void createCityDto;
    return 'Создание города';
  }

  findAll() {
    return 'Получение списка городов';
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
