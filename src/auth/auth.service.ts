import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { TokenResponse, RefreshTokenResponse } from "./dto/auth-response.dto";

interface JwtPayload<T = any> {
  sub: string; // JWT standard: subject (user identifier)
  data: T; // Custom user payload
  type: "access" | "refresh";
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 10;
  private readonly jwtSecret: string;
  private readonly jwtAccessExpiration: string;
  private readonly jwtRefreshExpiration: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    this.jwtSecret = this.configService.get("auth.jwtSecret")!;
    this.jwtAccessExpiration = this.configService.get(
      "auth.jwtAccessExpiration"
    )!;
    this.jwtRefreshExpiration = this.configService.get(
      "auth.jwtRefreshExpiration"
    )!;
  }

  /**
   * Encrypt string with salt
   */
  async encryptString(string: string): Promise<string> {
    return bcrypt.hash(string, this.saltRounds);
  }

  /**
   * Verify string against encrypted string
   */
  async verifyString(
    string: string,
    encryptedString: string
  ): Promise<boolean> {
    return bcrypt.compare(string, encryptedString);
  }

  /**
   * Generate access token
   */
  async generateAccessToken<T extends Record<string, any>>(
    subject: string,
    userPayload: T
  ): Promise<string> {
    const jwtPayload: JwtPayload<T> = {
      sub: subject,
      data: userPayload,
      type: "access",
    };

    return this.jwtService.sign(jwtPayload, {
      expiresIn: this.jwtAccessExpiration,
      secret: this.jwtSecret,
    });
  }

  /**
   * Generate refresh token
   */
  async generateRefreshToken<T extends Record<string, any>>(
    subject: string,
    userPayload: T
  ): Promise<string> {
    const jwtPayload: JwtPayload<T> = {
      sub: subject,
      data: userPayload,
      type: "refresh",
    };

    return this.jwtService.sign(jwtPayload, {
      expiresIn: this.jwtRefreshExpiration,
      secret: this.jwtSecret,
    });
  }

  /**
   * Generate both access and refresh tokens
   */
  async generateTokens<T extends Record<string, any>>(
    subject: string,
    userPayload: T = {} as T
  ): Promise<TokenResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(subject, userPayload),
      this.generateRefreshToken(subject, userPayload),
    ]);

    const expiresIn = this.getExpirationTimeInSeconds();

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(
    refreshToken: string
  ): Promise<RefreshTokenResponse> {
    try {
      const jwtPayload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.jwtSecret,
      });

      if (jwtPayload.type !== "refresh") {
        this.logger.warn("Invalid token type provided for refresh");
        throw new UnauthorizedException("Invalid token type");
      }

      const tokens = await this.generateTokens(jwtPayload.sub, jwtPayload.data);

      this.logger.log(
        `Access token refreshed successfully with params=${jwtPayload.sub}`
      );
      return tokens;
    } catch (error) {
      this.logger.error("Failed to refresh token:", error);
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  private getExpirationTimeInSeconds(): number {
    const expiration = this.jwtAccessExpiration;

    if (expiration.includes("m")) {
      return parseInt(expiration.replace("m", "")) * 60;
    } else if (expiration.includes("h")) {
      return parseInt(expiration.replace("h", "")) * 3600;
    } else if (expiration.includes("d")) {
      return parseInt(expiration.replace("d", "")) * 86400;
    }

    return 900; // Default 15 minutes
  }
}
