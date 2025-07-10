import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class JwtCafeOwnerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // This middleware expects the JWT payload to be already attached by JwtCommonMiddleware
    if (!req.jwtPayload) {
      throw new UnauthorizedException(
        "JWT payload not found. Ensure JwtCommonMiddleware is applied first."
      );
    }

    // Extract ownerId from the request body
    const ownerId = req.body?.ownerId;

    if (!ownerId) {
      throw new UnauthorizedException("Owner ID is missing in request body");
    }

    // Check if the JWT subject matches the ownerId from request body
    if (req.jwtPayload.sub !== ownerId) {
      throw new UnauthorizedException(
        "Access denied: Token subject does not match owner ID"
      );
    }

    next();
  }
}
