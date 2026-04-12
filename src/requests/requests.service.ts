import { Injectable, NotFoundException, ConflictException, BadRequestException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { RequestStatus } from '../common/enums/request-status.enum';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { SkillsService } from 'src/skills/skills.service';
import { UsersService } from 'src/users/users.service';
import { NotificationPayloadDto } from 'src/notifications/dto/notification-payload.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly skillsService: SkillsService,
    private readonly usersService: UsersService,
  ) { }

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

    if (!requestsIncomingData) {
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
        totalPage: Math.ceil(totalRequest / 10),
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

    if (!requestsIncomingData) {
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
        totalPage: Math.ceil(totalRequest / 10),
      },
    };
  }

  async createRequest(
    senderId: string,
    offeredSkillId: string,
    requestedSkillId: string,
  ) {
    const offeredSkill = await this.skillsService.findOne(offeredSkillId);
    if (!offeredSkill) {
      throw new NotFoundException('Предлагаемый навык не найден');
    }

    const requestedSkill = await this.skillsService.findOne(requestedSkillId);
    if (!requestedSkill) {
      throw new NotFoundException('Запрашиваемый навык не найден');
    }

    if (offeredSkill.owner.id !== senderId) {
      throw new BadRequestException('Вы можете предлагать только свои навыки');
    }

    if (offeredSkill.owner.id === requestedSkill.owner.id) {
      throw new BadRequestException('Нельзя отправить заявку самому себе');
    }

    const request = this.requestsRepository.create({
      senderId: senderId,
      receiverId: requestedSkill.owner.id,
      offeredSkillId: offeredSkillId,
      requestedSkillId: requestedSkillId,
      status: RequestStatus.PENDING,
      isRead: false,
    });

    await this.requestsRepository.save(request);

    const sender = await this.usersService.findOne(senderId);

    const notificationPayload: NotificationPayloadDto = {
    type: 'new_request',
    skillTitle: requestedSkill.title,
    fromUser: {
      id: sender.id,
      name: sender.name,
    },
  };
    await this.notificationsGateway.notifyUser(requestedSkill.owner.id, notificationPayload);

    return this.requestsRepository.findOne({
      where: { id: request.id },
      relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
    });
  }

 
  async acceptRequest(requestId: string, userId: string) {
    const request = await this.requestsRepository.findOne({
      where: { id: requestId },
      relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
    });

    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }

    if (request.receiverId !== userId) {
      throw new BadRequestException('Вы можете принять только входящую заявку');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Заявка не в ожидании');
    }

    request.status = RequestStatus.IN_PROGRESS;
    await this.requestsRepository.save(request);

    const notificationPayload: NotificationPayloadDto = {
      type: 'request_accepted',
      skillTitle: request.requestedSkill.title,
      fromUser: {
        id: request.receiver.id,
        name: request.receiver.name,
      },
    };
    await this.notificationsGateway.notifyUser(request.senderId, notificationPayload);

    return this.requestsRepository.findOne({
        where: { id: requestId },
        relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
    });
  }

    async rejectRequest(requestId: string, userId: string) {
      const request = await this.requestsRepository.findOne({
        where: { id: requestId },
        relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
      });

      if (!request) {
        throw new NotFoundException('Заявка не найдена');
      }

      if (request.receiverId !== userId) {
        throw new BadRequestException('Вы можете отклонить только входящую заявку');
      }

      if (request.status !== RequestStatus.PENDING) {
        throw new BadRequestException('Можно отклонить только заявку в статусе ожидания');
      }

      request.status = RequestStatus.REJECTED;
      await this.requestsRepository.save(request);

      const notificationPayload: NotificationPayloadDto = {
        type: 'request_rejected',
        skillTitle: request.requestedSkill.title,
        fromUser: {
          id: request.receiver.id,
          name: request.receiver.name,
        },
      };

      await this.notificationsGateway.notifyUser(request.senderId, notificationPayload);

      return {
        message: 'Заявка успешно отклонена',
        requestId: request.id,
        status: request.status,
      };
    }
}
