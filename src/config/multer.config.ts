import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { MAX_FILE_SIZE } from './files.config';

export const multerOptions: MulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      const uploadPath = join(process.cwd(), 'public');
      if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const ext = file.originalname.split('.').pop() || '';
      cb(null, `file_${timestamp}_${random}.${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/gif',
      'image/svg+xml',
      'image/webp',
    ];
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fileSize: MAX_FILE_SIZE },
};
