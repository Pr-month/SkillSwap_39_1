import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  create(createCategoryDto: CreateCategoryDto) {
    void createCategoryDto;
    return 'Создание категории';
  }

  findAll() {
    return 'Получение списка категорий';
  }

  findOne(id: string) {
    return `Получение категории с id ${id}`;
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    void updateCategoryDto;
    return `Обновление категории с id ${id}`;
  }

  remove(id: string) {
    return `Удаление категории с id ${id}`;
  }
}
