import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Skill } from './entities/skill.entity';
import { Repository } from 'typeorm';
import { GetSkillsQueryDto } from './dto/get-skills-query.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill-dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    const totalPages = Math.ceil(total / limit);

    if (page > Math.max(totalPages, 1)) {
      throw new NotFoundException('Страница навыков не найдена');
    }

    return {
      data: [...skills],
      meta: {
        page,
        limit,
        skip,
        take,
        total,
        totalPages,
        hasNext: page < totalPages,
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

  async update(id: string, dto: UpdateSkillDto) {
    const hasUpdates =
      dto.title !== undefined ||
      dto.description !== undefined ||
      dto.images !== undefined ||
      dto.categoryId !== undefined;

    if (!hasUpdates) {
      throw new BadRequestException('No fields provided for update');
    }

    const skill = await this.skillRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    if (dto.title !== undefined) {
      skill.title = dto.title;
    }

    if (dto.description !== undefined) {
      skill.description = dto.description;
    }

    if (dto.images !== undefined) {
      skill.images = dto.images;
    }

    if (dto.categoryId !== undefined) {
      skill.category = { id: dto.categoryId } as Skill['category'];
    }

    await this.skillRepository.save(skill);

    return this.skillRepository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async remove(id: string) {
    const result = await this.skillRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('Skill not found');
    }

    return {
      message: 'Skill deleted successfully',
    };
  }

  async removeFromFavoriteSkill(skillId: string, userId: string) {
    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
    });

    if (!skill) {
      throw new NotFoundException('Не существует данного навыка');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favoriteSkills'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isFavorite = user.favoriteSkills.some(
      (favoriteSkill) => favoriteSkill.id === skillId,
    );

    if (!isFavorite) {
      throw new NotFoundException('Навык не найден в избранном');
    }

    user.favoriteSkills = user.favoriteSkills.filter(
      (favoriteSkill) => favoriteSkill.id !== skillId,
    );
    await this.userRepository.save(user);

    return {
      message: `Навык ${skill.title} удален из избранного`,
      skill: {
        id: skill.id,
        title: skill.title,
      },
    };
  }

  async addToFavoriteSkill(skillId: string, userId: string) {
    const skill = await this.skillRepository.findOne({
      where: { id: skillId },
    });

    if (!skill) {
      throw new NotFoundException('Не существует данного навыка');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favoriteSkills'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isAlreadyFavorite = user.favoriteSkills.some(
      (favSkill) => favSkill.id === skillId,
    );

    if (isAlreadyFavorite) {
      throw new ConflictException('Навык уже был добавлен в избранное ранее');
    }

    user.favoriteSkills.push(skill);
    await this.userRepository.save(user);

    return {
      message: `Навык ${skill.title} добавлен в избранное`,
      skill: {
        id: skill.id,
        title: skill.title,
      },
    };
  }
}
