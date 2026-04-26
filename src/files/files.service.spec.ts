import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { FilesService } from './files.service';

type FilesRepositoryMock = Partial<
  Record<keyof Repository<File>, jest.Mock>
> & {
  create: jest.Mock;
  save: jest.Mock;
};

describe('FilesService', () => {
  let service: FilesService;
  let filesRepository: FilesRepositoryMock;

  beforeEach(async () => {
    filesRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getRepositoryToken(File),
          useValue: filesRepository,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('сервис должен определяться', () => {
    expect(service).toBeDefined();
  });

  it('saveFileInfo должен формировать сущность и возвращать публичные данные файла', async () => {
    const uploadedFile = {
      filename: 'avatar.png',
      originalname: 'avatar-original.png',
      size: 2048,
      mimetype: 'image/png',
    } as Express.Multer.File;

    const createdEntity = {
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalname,
      url: '/avatar.png',
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype,
      userId: 'user-id',
    };

    const savedEntity = {
      id: 'file-id',
      ...createdEntity,
    };

    filesRepository.create.mockReturnValue(createdEntity);
    filesRepository.save.mockResolvedValue(savedEntity);

    await expect(
      service.saveFileInfo(uploadedFile, 'user-id'),
    ).resolves.toEqual({
      message: 'Файл успешно загружен',
      id: 'file-id',
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalname,
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype,
      url: '/avatar.png',
    });

    expect(filesRepository.create).toHaveBeenCalledWith({
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalname,
      url: '/avatar.png',
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype,
      userId: 'user-id',
    });
    expect(filesRepository.save).toHaveBeenCalledWith(createdEntity);
  });

  it('saveFileInfo должен сохранять файл без userId, если он не передан', async () => {
    const uploadedFile = {
      filename: 'cover.jpeg',
      originalname: 'cover-original.jpeg',
      size: 512,
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    const createdEntity = {
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalname,
      url: '/cover.jpeg',
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype,
      userId: undefined,
    };

    filesRepository.create.mockReturnValue(createdEntity);
    filesRepository.save.mockResolvedValue({
      id: 'second-file-id',
      ...createdEntity,
    });

    await service.saveFileInfo(uploadedFile);

    expect(filesRepository.create).toHaveBeenCalledWith({
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalname,
      url: '/cover.jpeg',
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype,
      userId: undefined,
    });
  });
});
