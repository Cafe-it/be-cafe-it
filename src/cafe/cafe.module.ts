import { Module, Logger } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CafeController } from "./cafe.controller";
import { CafeService } from "./cafe.service";
import { CafeRepository } from "./repository/cafe.repository";
import { CafeTransformService } from "./services/cafe-transform.service";
import { CafeValidationService } from "./services/cafe-validation.service";
import { Cafe, CafeSchema } from "./schemas/cafe.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cafe.name, schema: CafeSchema }]),
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
  ],
  exports: [CafeService, CafeTransformService, CafeValidationService],
})
export class CafeModule {}
