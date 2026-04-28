import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  async saveFileInfo(file: Express.Multer.File, userId?: string) {
    // Формируем публичную ссылку
    const publicUrl = `/${file.filename}`;

    // Создаем объект файла
    const fileEntity = this.fileRepository.create({
      filename: file.filename,
      originalName: file.originalname,
      url: publicUrl,
      size: file.size,
      mimetype: file.mimetype,
      userId: userId,
    });

    // Сохраняем в базу данных
    const savedFile = await this.fileRepository.save(fileEntity);

    return {
      message: 'Файл успешно загружен',
      id: savedFile.id,
      filename: savedFile.filename,
      originalName: savedFile.originalName,
      size: savedFile.size,
      mimetype: savedFile.mimetype,
      url: savedFile.url,
    };
  }
}
