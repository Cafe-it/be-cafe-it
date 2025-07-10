import {
  Module,
  Logger,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OwnerController } from "./owner.controller";
import { OwnerService } from "./owner.service";
import { OwnerRepository } from "./repository/owner.repository";
import { AuthModule } from "../auth/auth.module";
import { Owner, OwnerSchema } from "./schemas/owner.schema";
import { JwtCommonMiddleware } from "../common/middlewares/jwt-common.middleware";
import { JwtOwnerMiddleware } from "../common/middlewares/jwt-owner.middleware";
import { JwtOwnerAuthMiddleware } from "../common/middlewares/jwt-owner-auth.middleware";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Owner.name, schema: OwnerSchema }]),
    AuthModule,
  ],
  controllers: [OwnerController],
  providers: [
    OwnerService,
    Logger,
    OwnerRepository,
    JwtCommonMiddleware,
    JwtOwnerMiddleware,
    JwtOwnerAuthMiddleware,
  ],
  exports: [OwnerService],
})
export class OwnerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtOwnerAuthMiddleware).forRoutes(
      // Apply middleware to routes that need owner authentication
      { path: "owners/:ownerId", method: RequestMethod.GET },
      { path: "owners/:ownerId", method: RequestMethod.PUT },
      { path: "owners/:ownerId", method: RequestMethod.DELETE }
    );
  }
}
