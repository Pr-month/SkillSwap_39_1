import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { Repository } from 'typeorm';
import { GetSkillsQueryDto } from './dto/get-skills-query.dto';
import { CreateSkillDto } from './dto/create-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async findAll(queryDto: GetSkillsQueryDto) {
    const { page = 1, limit = 10 } = queryDto;

    const skip = (page - 1) * limit;
    const take = limit;

    const [skills, total] = await this.skillRepository.findAndCount({
      skip,
      take,
      order: {
        title: 'ASC',
      },
    });

    return {
      data: [...skills],
      meta: {
        page,
        limit,
        skip,
        take,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async create(dto: CreateSkillDto) {
    const skill = this.skillRepository.create({
      title: dto.title,
      description: dto.description,
      images: dto.images,
      category: { id: dto.categoryId }, //TODO: так как пока нету реализации категорий вставляем так
    });

    return await this.skillRepository.save(skill);
  }
}
