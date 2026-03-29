import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    void createCategoryDto;
    return 'Создание категории';
  }

  findAll() {
    return this.categoriesRepository.find({
      where: {
        parentId: IsNull(),
      },
      relations: {
        children: true,
      },
      order: {
        name: 'ASC',
        children: {
          name: 'ASC',
        },
      },
    });
  }

  findOne(id: string) {
    return `Получение категории с id ${id}`;
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    void updateCategoryDto;
    return `Обновление категории с id ${id}`;
  }

  async remove(id: string) {
    const category = await this.categoriesRepository.findOneBy({ id });

    if (!category)
      throw new NotFoundException('Категория для удаления не найдена');

    await this.categoriesRepository.remove(category);

    return { message: `Категория "${category.name}" успешно удалена` };
  }
}
