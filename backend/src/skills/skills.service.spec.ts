import { Test, TestingModule } from '@nestjs/testing';
import { SkillsService } from './skills.service';
import { Skill } from './entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GetSkillsQueryDto } from './dto/get-skills-query.dto';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Gender } from '../common/enums/gender.enum';
import { Role } from '../common/enums/role.enum';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill-dto';

type QueryBuilderMock = {
  leftJoinAndSelect: jest.Mock<QueryBuilderMock, [string, string]>;
  orderBy: jest.Mock<QueryBuilderMock, [string, string]>;
  skip: jest.Mock<QueryBuilderMock, [number]>;
  take: jest.Mock<QueryBuilderMock, [number]>;
  andWhere: jest.Mock<QueryBuilderMock, [unknown, unknown?]>;
  getManyAndCount: jest.Mock<Promise<[Skill[], number]>, []>;
};

type SkillsRepositoryMock = {
  createQueryBuilder: jest.Mock<QueryBuilderMock, [string]>;
  create: jest.Mock<Skill, [Partial<Skill>]>;
  save: jest.Mock<Promise<Skill>, [Skill]>;
  findOne: jest.Mock<Promise<Skill | null>, [unknown]>;
  delete: jest.Mock<Promise<any>, [string | string[]]>;
};

type UsersRepositoryMock = {
  findOne: jest.Mock<Promise<User | null>, [unknown]>;
  save: jest.Mock<Promise<User>, [User]>;
};

describe('SkillsService', () => {
  let service: SkillsService;
  let skillsRepository: SkillsRepositoryMock;
  let usersRepository: UsersRepositoryMock;
  let queryBuilder: QueryBuilderMock;

  const mockSkills = [
    {
      id: '3',
      title: 'JS',
      description: 'test try JS',
      owner: { id: '1' },
      category: { id: '738', title: 'science' },
    },
    {
      id: '4',
      title: 'Backend',
      description: 'test try backend',
      owner: { id: '2' },
      category: { id: '541', title: 'science' },
    },
  ] as unknown as Skill[];

  const mockUser = {
    id: '1',
    name: 'test',
    email: 'test@yand.ru',
    about: 'test about',
    city: 'city',
    gender: Gender.FEMALE,
    avatar: 'test.jpg',
    role: Role.USER,
    favoriteSkills: mockSkills,
  } as User;

  beforeEach(async () => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn(),
      orderBy: jest.fn(),
      skip: jest.fn(),
      take: jest.fn(),
      andWhere: jest.fn(),
      getManyAndCount: jest.fn(),
    };
    queryBuilder.leftJoinAndSelect.mockReturnValue(queryBuilder);
    queryBuilder.orderBy.mockReturnValue(queryBuilder);
    queryBuilder.skip.mockReturnValue(queryBuilder);
    queryBuilder.take.mockReturnValue(queryBuilder);
    queryBuilder.andWhere.mockReturnValue(queryBuilder);

    skillsRepository = {
      createQueryBuilder: jest.fn<QueryBuilderMock, [string]>(),
      create: jest.fn<Skill, [Partial<Skill>]>(),
      save: jest.fn<Promise<Skill>, [Skill]>(),
      findOne: jest.fn<Promise<Skill | null>, [unknown]>(),
      delete: jest.fn<Promise<any>, [string | string[]]>(),
    };
    skillsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    usersRepository = {
      findOne: jest.fn<Promise<User | null>, [unknown]>(),
      save: jest.fn<Promise<User>, [User]>(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: getRepositoryToken(Skill),
          useValue: skillsRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('проверка метода findAll', () => {
    const pageQueryMock: GetSkillsQueryDto = {
      page: 2,
      limit: 5,
    };
    const totalSkillsMock = 20;

    it('проверка успешного ответа', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([
        mockSkills,
        totalSkillsMock,
      ]);

      const result = await service.findAll(pageQueryMock);

      expect(skillsRepository.createQueryBuilder).toHaveBeenCalledWith('skill');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'skill.category',
        'category',
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('skill.title', 'ASC');
      expect(queryBuilder.skip).toHaveBeenCalledWith(
        (pageQueryMock.page - 1) * pageQueryMock.limit,
      );
      expect(queryBuilder.take).toHaveBeenCalledWith(pageQueryMock.limit);
      expect(result).toEqual({
        data: [...mockSkills],
        meta: {
          page: pageQueryMock.page,
          limit: pageQueryMock.limit,
          skip: (pageQueryMock.page - 1) * pageQueryMock.limit,
          take: pageQueryMock.limit,
          total: totalSkillsMock,
          totalPages: Math.ceil(totalSkillsMock / pageQueryMock.limit),
          hasNext:
            pageQueryMock.page <
            Math.ceil(totalSkillsMock / pageQueryMock.limit),
          hasPrev: pageQueryMock.page > 1,
        },
      });
    });

    it('проверка ошибки при попытке запроса страницы с номером, большим, чем общее число страниц', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([mockSkills, 4]);

      await expect(service.findAll(pageQueryMock)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('проверка метода create', () => {
    const createDTOMock: CreateSkillDto = {
      title: 'New skill',
      categoryId: '578',
    };
    const newSkillMock = {
      id: '5',
      title: createDTOMock.title,
      owner: { id: '1' },
      category: { id: '578' },
    } as Skill;

    it('проверка успешного ответа', async () => {
      skillsRepository.create.mockReturnValue(newSkillMock);
      skillsRepository.save.mockResolvedValue(newSkillMock);

      const result = await service.create(createDTOMock);

      expect(skillsRepository.create).toHaveBeenCalledWith({
        title: createDTOMock.title,
        description: undefined,
        images: undefined,
        category: { id: createDTOMock.categoryId },
      });
      expect(skillsRepository.save).toHaveBeenCalledWith(newSkillMock);
      expect(result).toEqual(newSkillMock);
    });
  });

  describe('проверка метода update', () => {
    const updateDTOMock: UpdateSkillDto = {
      title: 'New skill',
      categoryId: '578',
    };
    const newSkillMock = {
      id: '3',
      title: updateDTOMock.title,
      owner: { id: '1' },
      category: { id: updateDTOMock.categoryId },
    } as Skill;

    it('проверка успешного ответа', async () => {
      skillsRepository.findOne
        .mockResolvedValueOnce(mockSkills[0])
        .mockResolvedValueOnce(newSkillMock);
      skillsRepository.save.mockResolvedValue(newSkillMock);

      const result = await service.update('3', updateDTOMock);

      expect(skillsRepository.findOne).toHaveBeenCalledTimes(2);
      expect(result).toEqual(newSkillMock);
    });

    it('проверка ошибки при попытке обновления данных навыка без обновлений', async () => {
      const updateMock = {} as UpdateSkillDto;
      await expect(service.update('3', updateMock)).rejects.toThrow(
        BadRequestException,
      );

      expect(skillsRepository.findOne).not.toHaveBeenCalled();
      expect(skillsRepository.save).not.toHaveBeenCalled();
    });

    it('проверка ошибки при запросе к несущестующему навыку', async () => {
      skillsRepository.findOne.mockResolvedValue(null);

      await expect(service.update('1', updateDTOMock)).rejects.toThrow(
        NotFoundException,
      );

      expect(skillsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(skillsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('проверка метода remove', () => {
    it('проверка успешного ответа', async () => {
      skillsRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove('3');
      expect(skillsRepository.delete).toHaveBeenCalledWith('3');
      expect(result).toEqual({ message: 'Skill deleted successfully' });
    });

    it('проверка ошибки при попытке удаления несуществующего навыка', async () => {
      skillsRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('проверка метода removeFromFavoriteSkill', () => {
    it('проверка успешного ответа', async () => {
      skillsRepository.findOne.mockResolvedValue(mockSkills[0]);
      usersRepository.findOne.mockResolvedValue(mockUser);
      usersRepository.save.mockResolvedValue({
        ...mockUser,
        favoriteSkills: [mockSkills[1]],
      });

      const result = await service.removeFromFavoriteSkill('3', '1');

      expect(skillsRepository.findOne).toHaveBeenCalledWith({
        where: { id: '3' },
      });
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['favoriteSkills'],
      });
      expect(usersRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        favoriteSkills: [mockSkills[1]],
      });
      expect(result).toEqual({
        message: `Навык ${mockSkills[0].title} удален из избранного`,
        skill: {
          id: mockSkills[0].id,
          title: mockSkills[0].title,
        },
      });
    });

    it('проверка ошибки при запросе к несущестующему навыку', async () => {
      skillsRepository.findOne.mockResolvedValue(null);

      await expect(service.removeFromFavoriteSkill('1', '1')).rejects.toThrow(
        NotFoundException,
      );

      expect(usersRepository.findOne).not.toHaveBeenCalled();
      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('проверка ошибки при запросе от несущестующего пользователя', async () => {
      skillsRepository.findOne.mockResolvedValue(mockSkills[0]);
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.removeFromFavoriteSkill('1', '1')).rejects.toThrow(
        NotFoundException,
      );

      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('проверка ошибки при удалении неизбранного навыка из списка', async () => {
      skillsRepository.findOne.mockResolvedValue(mockSkills[0]);
      usersRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.removeFromFavoriteSkill('6', '1')).rejects.toThrow(
        NotFoundException,
      );

      expect(usersRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('проверка метода addToFavoriteSkill', () => {
    it('проверка успешного ответа', async () => {
      skillsRepository.findOne.mockResolvedValue(mockSkills[1]);
      usersRepository.findOne.mockResolvedValue({
        ...mockUser,
        favoriteSkills: [],
      });
      usersRepository.save.mockResolvedValue({
        ...mockUser,
        favoriteSkills: [mockSkills[1]],
      });

      const result = await service.addToFavoriteSkill('4', '1');

      expect(skillsRepository.findOne).toHaveBeenCalledWith({
        where: { id: '4' },
      });
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['favoriteSkills'],
      });
      expect(usersRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        favoriteSkills: [mockSkills[1]],
      });
      expect(result).toEqual({
        message: `Навык ${mockSkills[1].title} добавлен в избранное`,
        skill: {
          id: mockSkills[1].id,
          title: mockSkills[1].title,
        },
      });
    });

    it('проверка ошибки при запросе к несущестующему навыку', async () => {
      skillsRepository.findOne.mockResolvedValue(null);

      await expect(service.addToFavoriteSkill('1', '1')).rejects.toThrow(
        NotFoundException,
      );

      expect(usersRepository.findOne).not.toHaveBeenCalled();
      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('проверка ошибки при запросе от несущестующего пользователя', async () => {
      skillsRepository.findOne.mockResolvedValue(mockSkills[0]);
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.addToFavoriteSkill('1', '1')).rejects.toThrow(
        NotFoundException,
      );

      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('проверка ошибки при повторной попытке добавления навыка в избранное', async () => {
      skillsRepository.findOne.mockResolvedValue(mockSkills[0]);
      usersRepository.findOne.mockResolvedValue({
        ...mockUser,
        favoriteSkills: [mockSkills[0]],
      });

      await expect(
        service.addToFavoriteSkill(mockSkills[0].id, '1'),
      ).rejects.toThrow(ConflictException);

      expect(usersRepository.save).not.toHaveBeenCalled();
    });
  });
});
