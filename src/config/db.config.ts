import { ConfigType, registerAs} from "@nestjs/config";
import { DataSourceOptions } from "typeorm"; 

export const dbConfig = registerAs('DB_CONFIG',(): DataSourceOptions => ({
    type: 'postgres', 
    port: Number(process.env.DB_PORT) || 5432,
    host: process.env.DB_HOST || "localhost",
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_DATABASE || "skillswap",
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
  }),
);

export type IDBConfig = ConfigType<typeof dbConfig>;