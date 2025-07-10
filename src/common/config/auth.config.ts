import { registerAs } from "@nestjs/config";

export interface AuthConfig {
  jwtSecret: string;
  jwtAccessExpiration: string;
  jwtRefreshExpiration: string;
}

export default registerAs(
  "auth",
  (): AuthConfig => ({
    jwtSecret: process.env.JWT_SECRET!,
    jwtAccessExpiration: process.env.JWT_ACCESS_EXPIRATION!,
    jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION!,
  })
);
