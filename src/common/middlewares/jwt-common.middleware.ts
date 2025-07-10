import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

interface JwtPayload<T = any> {
  sub: string;
  data: T;
  type: "access" | "refresh";
  iat?: number;
  exp?: number;
}

// Extend the Request interface to include the JWT payload
declare global {
  namespace Express {
    interface Request {
      jwtPayload?: JwtPayload;
    }
  }
}

@Injectable()
export class JwtCommonMiddleware implements NestMiddleware {
  private readonly jwtSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    this.jwtSecret = this.configService.get("auth.jwtSecret")!;
  }

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Missing or invalid authorization header"
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.jwtSecret,
      });

      // Check if it's an access token
      if (payload.type !== "access") {
        throw new UnauthorizedException("Invalid token type");
      }

      // Attach the payload to the request object
      req.jwtPayload = payload;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new UnauthorizedException("Access token has expired");
      } else if (error.name === "JsonWebTokenError") {
        throw new UnauthorizedException("Invalid access token");
      } else {
        throw new UnauthorizedException("Authentication failed");
      }
    }
  }
}
