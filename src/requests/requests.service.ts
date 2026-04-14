import { Injectable, NotFoundException, ConflictException, BadRequestException  } from '@nestjs/common';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { RequestStatus } from '../common/enums/request-status.enum';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { SkillsService } from 'src/skills/skills.service';
import { UsersService } from 'src/users/users.service';
import { NotificationPayloadDto } from 'src/notifications/dto/notification-payload.dto';
import { Role } from '../common/enums/role.enum';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly skillsService: SkillsService,
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async findOutgoing(userId: string, page: number = 1, limit: number = 10) {
    if (page < 1) {
      page = 1;
    }
    if (limit < 1) {
      limit = 10;
    }
    if (limit > 100) {
      limit = 100;
    }

    const [requestsIncomingData, totalRequest] =
      await this.requestsRepository.findAndCount({
        where: {
          senderId: userId,
          status: In([RequestStatus.IN_PROGRESS, RequestStatus.PENDING]),
        },
        relations: {
          receiver: true, //загружаем информацию о получателе заявки
          offeredSkill: true, //загружаем информацию о предлагаемых навыках
          requestedSkill: true, //загружаем информацию о запрашиваемых навыках
        },
        order: { createdAt: 'DESC' }, //возвращаем список заявок по принципу от последней созданной
        take: limit,
        skip: (page - 1) * limit,
      });

    if (requestsIncomingData.length === 0) {
      throw new NotFoundException(
        'Пользователь или исходящие заявки не найдены',
      );
    }

    return {
      data: requestsIncomingData,
      pagination: {
        page,
        limit,
        total: totalRequest,
        totalPage: Math.ceil(totalRequest / limit),
      },
    };
  }

  async findIncoming(userId: string, page: number = 1, limit: number = 10) {
    if (page < 1) {
      page = 1;
    }
    if (limit < 1) {
      limit = 10;
    }
    if (limit > 100) {
      limit = 100;
    }

    const [requestsIncomingData, totalRequest] =
      await this.requestsRepository.findAndCount({
        where: {
          receiverId: userId,
          status: In([RequestStatus.IN_PROGRESS, RequestStatus.PENDING]),
        },
        relations: {
          sender: true, //загружаем информацию об отправителе заявки
          offeredSkill: true, //загружаем информацию о предлагаемых навыках
          requestedSkill: true, //загружаем информацию о запрашиваемых навыках
        },
        order: { createdAt: 'DESC' }, //возвращаем список заявок по принципу от последней созданной
        take: limit,
        skip: (page - 1) * limit,
      });

    if (requestsIncomingData.length === 0) {
      throw new NotFoundException(
        'Пользователь или входящие заявки не найдены',
      );
    }

    return {
      data: requestsIncomingData,
      pagination: {
        page,
        limit,
        total: totalRequest,
        totalPage: Math.ceil(totalRequest / limit),
      },
    };
  }

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
      sender: { id: senderId },
      receiver: { id: receiverId },
      offeredSkill: { id: dto.offeredSkillId },
      requestedSkill: { id: dto.requestedSkillId },
    });
    
       const notificationPayload: NotificationPayloadDto = {
    type: 'new_request',
    skillTitle: requestedSkill.title,
    fromUser: {
      id: sender.id,
      name: sender.name,
    },
  };
    await this.notificationsGateway.notifyUser(requestedSkill.owner.id, notificationPayload);

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
    
    
    const notificationPayload: NotificationPayloadDto = {
      type: 'request_accepted',
      skillTitle: request.requestedSkill.title,
      fromUser: {
        id: request.receiver.id,
        name: request.receiver.name,
      },
    };
    await this.notificationsGateway.notifyUser(request.senderId, notificationPayload);

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
      throw new ForbiddenException('Удалить можно только отправленную заявку');
    }

    await this.requestsRepository.delete(id);

    return {
      message: 'Заявка успешно удалена',
    };
  }
}
