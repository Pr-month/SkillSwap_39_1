import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Request } from '../request.entity';
import { RequestStatus } from '../../common/enums/request-status.enum';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
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
}
