import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('FilesController', () => {
  let controller: FilesController;
  let filesService: { saveFileInfo: jest.Mock };

  beforeEach(async () => {
    filesService = {
      saveFileInfo: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: filesService,
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
  });

  it('контроллер должен определяться', () => {
    expect(controller).toBeDefined();
  });

  it('uploadFile должен выбрасывать BadRequestException, если файл не передан', async () => {
    await expect(
      controller.uploadFile(undefined as never),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(filesService.saveFileInfo).not.toHaveBeenCalled();
  });

  it('uploadFile должен сохранять файл через сервис и возвращать результат', async () => {
    const file = {
      filename: 'avatar.png',
      originalname: 'avatar-original.png',
      size: 1024,
      mimetype: 'image/png',
    } as Express.Multer.File;

    const expectedResponse = {
      message: 'Файл успешно загружен',
      id: 'file-id',
      filename: 'avatar.png',
      originalName: 'avatar-original.png',
      size: 1024,
      mimetype: 'image/png',
      url: '/avatar.png',
    };

    filesService.saveFileInfo.mockResolvedValue(expectedResponse);

    await expect(controller.uploadFile(file)).resolves.toEqual(
      expectedResponse,
    );
    expect(filesService.saveFileInfo).toHaveBeenCalledWith(file);
  });
});
