import { Test, TestingModule } from '@nestjs/testing';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { FindRequestsQueryDto } from './dto/find-requests-query.dto';
import { AuthRequest } from '../auth/types/types';

type RequestsServiceMock = {
  findOutgoing: jest.Mock<Promise<unknown>, [string, number, number]>;
  findIncoming: jest.Mock<Promise<unknown>, [string, number, number]>;
};

describe('RequestsController', () => {
  let controller: RequestsController;
  let requestsService: RequestsServiceMock;

  beforeEach(async () => {
    requestsService = {
      findOutgoing: jest.fn<Promise<unknown>, [string, number, number]>(),
      findIncoming: jest.fn<Promise<unknown>, [string, number, number]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsController],
      providers: [
        {
          provide: RequestsService,
          useValue: requestsService,
        },
      ],
    }).compile();

    controller = module.get<RequestsController>(RequestsController);
  });

  it('контроллер должен определяться', () => {
    expect(controller).toBeDefined();
  });

  it('должен передавать query-параметры в сервис для исходящих заявок', async () => {
    const req = {
      user: {
        sub: 'user-id',
      },
    } as AuthRequest;
    const query: FindRequestsQueryDto = {
      page: 2,
      limit: 5,
    };

    requestsService.findOutgoing.mockResolvedValue([]);

    await controller.findOutgoing(req, query);

    expect(requestsService.findOutgoing).toHaveBeenCalledWith('user-id', 2, 5);
  });

  it('должен использовать значения по умолчанию для входящих заявок', async () => {
    const req = {
      user: {
        sub: 'user-id',
      },
    } as AuthRequest;

    requestsService.findIncoming.mockResolvedValue([]);

    await controller.findIncoming(req, {});

    expect(requestsService.findIncoming).toHaveBeenCalledWith('user-id', 1, 10);
  });
});
