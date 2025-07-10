import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class JwtOwnerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // This middleware expects the JWT payload to be already attached by JwtCommonMiddleware
    if (!req.jwtPayload) {
      throw new UnauthorizedException(
        "JWT payload not found. Ensure JwtCommonMiddleware is applied first."
      );
    }

    // Extract ownerId from the request parameters
    const ownerId = req.params?.ownerId;

    if (!ownerId) {
      throw new UnauthorizedException("Owner ID parameter is missing");
    }

    // Check if the JWT subject matches the ownerId parameter
    if (req.jwtPayload.sub !== ownerId) {
      throw new UnauthorizedException(
        "Access denied: Token subject does not match owner ID"
      );
    }

    next();
  }
}
