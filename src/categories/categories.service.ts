import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, parentId } = createCategoryDto;

    const existingCategory = await this.categoriesRepository.findOneBy({
      name,
    });

    if (existingCategory) {
      throw new ConflictException(
        `Категория с названием "${name}" уже существует`,
      );
    }
    const parent = parentId ? await this.categoriesRepository.findOneBy({ id: parentId }) : null;
      
      if (parentId && !parent) {
        throw new NotFoundException(`Родительская категория с id "${parentId}" не найдена`);
      }

    const category = this.categoriesRepository.create({
      name,
      parent,
      parentId: parent?.id || null,
    });

    return this.categoriesRepository.save(category);
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

  remove(id: string) {
    return `Удаление категории с id ${id}`;
  }
}
