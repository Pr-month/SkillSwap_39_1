import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Валидация входящих данных в контроллерах
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // автоматически преобразует входные данные в экземпляры классов
      whitelist: true, // удаляет из объекта все свойства, которых нет в DTO
      forbidNonWhitelisted: true, // выбрасывает ошибку, если пришли лишние поля
    }),
  );

  // Раздача статических файлов из папки public
  app.useStaticAssets(join(process.cwd(), 'public'));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
