import { diskStorage } from 'multer';
import { join } from 'path';
import { MAX_FILE_SIZE } from './files.config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const multerOptions: MulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      cb(
        null,
        join(
          __dirname,
          process.env.UPLOAD_PATH_TEMP
            ? `../public/${process.env.UPLOAD_PATH_TEMP}`
            : '../public',
        ),
      );
    },
    filename: (_req, file, cb) => {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.originalname.split('.').pop() || '';
      cb(null, `file_${timestamp}_${randomString}.${extension}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const types = [
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/gif',
      'image/svg+xml',
      'image/webp',
    ];
    cb(null, types.includes(file.mimetype));
  },
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
};
