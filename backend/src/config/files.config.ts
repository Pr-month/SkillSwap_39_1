import { config } from 'dotenv';

config();

export const MAX_FILE_SIZE = parseInt(
  process.env.MAX_FILE_SIZE || '2097152',
  10,
);
