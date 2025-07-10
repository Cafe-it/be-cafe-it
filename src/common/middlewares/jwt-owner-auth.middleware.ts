import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { JwtCommonMiddleware } from "./jwt-common.middleware";
import { JwtOwnerMiddleware } from "./jwt-owner.middleware";

@Injectable()
export class JwtOwnerAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtCommonMiddleware: JwtCommonMiddleware,
    private readonly jwtOwnerMiddleware: JwtOwnerMiddleware
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Chain the middlewares: first JWT common validation, then owner-specific validation
    this.jwtCommonMiddleware.use(req, res, (error?: any) => {
      if (error) {
        next(error);
        return;
      }

      // If JWT common middleware passed, proceed to owner-specific middleware
      this.jwtOwnerMiddleware.use(req, res, next);
    });
  }
}
