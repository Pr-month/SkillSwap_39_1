import { ConfigType, registerAs} from "@nestjs/config";

export const appConfig = registerAs('APP_CONFIG',() => ({
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  }),
);

export type IAppConfig = ConfigType<typeof appConfig>;