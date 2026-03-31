import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  // Обновление категории по id
  async update(id: string, categoryDto: UpdateCategoryDto) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    // Нет такой категории
    if (!category)
      throw new NotFoundException('Категория не найдена в базе данных');

    // Обновить название, только если оно поменялось ...
    if (categoryDto.name && categoryDto.name !== category.name) {
      const nameOccupied = await this.categoriesRepository.findOneBy({
        name: categoryDto.name,
      });

      // ... и ещё не существует в базе
      if (nameOccupied)
        throw new ConflictException(
          `Название "${categoryDto.name}" уже есть в каталоге`,
        );

      category.name = categoryDto.name;
    }

    // Обновить родителя данной категории
    if (categoryDto.parentId !== undefined) {
      if (categoryDto.parentId === id)
        throw new BadRequestException('Категория не может быть себе родителем');

      if (categoryDto.parentId === null) {
        category.parent = null;
      } else {
        const parent = await this.categoriesRepository.findOneBy({
          id: categoryDto.parentId,
        });

        if (!parent) {
          throw new NotFoundException('Родитель не найден в базе данных');
        }

        category.parent = parent;
      }
    }

    return this.categoriesRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.categoriesRepository.findOneBy({ id });

    if (!category)
      throw new NotFoundException('Категория для удаления не найдена');

    await this.categoriesRepository.remove(category);

    return { message: `Категория "${category.name}" успешно удалена` };
  }
}
