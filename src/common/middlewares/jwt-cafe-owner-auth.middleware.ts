import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { JwtCommonMiddleware } from "./jwt-common.middleware";
import { JwtCafeOwnerMiddleware } from "./jwt-cafe-owner.middleware";

@Injectable()
export class JwtCafeOwnerAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtCommonMiddleware: JwtCommonMiddleware,
    private readonly jwtCafeOwnerMiddleware: JwtCafeOwnerMiddleware
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Chain the middlewares: first JWT common validation, then cafe owner-specific validation
    this.jwtCommonMiddleware.use(req, res, (error?: any) => {
      if (error) {
        next(error);
        return;
      }

      // If JWT common middleware passed, proceed to cafe owner-specific middleware
      this.jwtCafeOwnerMiddleware.use(req, res, next);
    });
  }
}
