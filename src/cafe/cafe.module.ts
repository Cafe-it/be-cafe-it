import {
  Module,
  Logger,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { JwtCommonMiddleware } from "../common/middlewares/jwt-common.middleware";
import { JwtCafeOwnerMiddleware } from "../common/middlewares/jwt-cafe-owner.middleware";
import { JwtCafeOwnerAuthMiddleware } from "../common/middlewares/jwt-cafe-owner-auth.middleware";
import { CafeController } from "./cafe.controller";
import { CafeService } from "./cafe.service";
import { CafeRepository } from "./repository/cafe.repository";
import { CafeTransformService } from "./services/cafe-transform.service";
import { CafeValidationService } from "./services/cafe-validation.service";
import { Cafe, CafeSchema } from "./schemas/cafe.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cafe.name, schema: CafeSchema }]),
    AuthModule,
  ],
  controllers: [CafeController],
  providers: [
    CafeService,
    CafeTransformService,
    CafeValidationService,
    Logger,
    {
      provide: "ICafeRepository",
      useClass: CafeRepository,
    },
    JwtCommonMiddleware,
    JwtCafeOwnerMiddleware,
    JwtCafeOwnerAuthMiddleware,
  ],
  exports: [CafeService, CafeTransformService, CafeValidationService],
})
export class CafeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtCafeOwnerAuthMiddleware).forRoutes(
      // Apply middleware to cafe endpoints that require owner authentication
      { path: "cafes/:cafeId/seats-availability", method: RequestMethod.PUT },
      { path: "cafes/:cafeId", method: RequestMethod.PUT }
    );
  }
}
