import { registerAs } from "@nestjs/config";

export interface AppConfig {
  nodeEnv: string;
  port: number;
  appName: string;
  apiPrefix: string;
}

export default registerAs(
  "app",
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV!,
    port: parseInt(process.env.PORT!, 10),
    appName: process.env.APP_NAME!,
    apiPrefix: process.env.API_PREFIX!,
  })
);
