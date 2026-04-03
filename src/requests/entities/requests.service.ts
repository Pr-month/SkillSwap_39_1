import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async create(senderId: string, dto: CreateRequestDto) {
    const requestedSkill = await this.skillsRepository.findOne({
      where: { id: dto.requestedSkillId },
      relations: {
        owner: true,
      },
    });

    if (!requestedSkill) {
      throw new NotFoundException('Запрашиваемый навык не найден');
    }

    const receiverId = requestedSkill.owner.id;

    if (senderId === receiverId) {
      throw new BadRequestException('Нельзя отправить заявку самому себе');
    }

    if (dto.offeredSkillId) {
      const offeredSkill = await this.skillsRepository.findOne({
        where: { id: dto.offeredSkillId },
      });

      if (!offeredSkill) {
        throw new NotFoundException('Предлагаемый навык не найден');
      }
    }

    const request = this.requestsRepository.create({
      senderId,
      receiverId,
      offeredSkillId: dto.offeredSkillId ?? null,
      requestedSkillId: dto.requestedSkillId,
    });

    return await this.requestsRepository.save(request);
  }

  async update(id: string, userId: string, dto: UpdateRequestDto) {
    const request = await this.requestsRepository.findOne({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }

    if (request.receiverId !== userId) {
      throw new ForbiddenException('Можно обновить только входящую заявку');
    }

    request.status = dto.status;

    return await this.requestsRepository.save(request);
  }

  async remove(id: string, userId: string) {
    const request = await this.requestsRepository.findOne({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isAdmin = user.role === Role.ADMIN;
    const isSender = request.senderId === userId;

    if (!isAdmin && !isSender) {
      throw new ForbiddenException(
        'Удалить можно только отправленную заявку',
      );
    }

    await this.requestsRepository.delete(id);

    return {
      message: 'Заявка успешно удалена',
    };
  }
}
