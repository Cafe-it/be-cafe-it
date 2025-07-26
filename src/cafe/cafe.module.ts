import { Module, Logger } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WinstonLoggerService } from "../common/services";
import { CafeController } from "./cafe.controller";
import { CafeService } from "./cafe.service";
import { Cafe, CafeSchema } from "./schemas/cafe.schema";
import { CafeRepository } from "./repository/cafe.repository";
import { CafeTransformService } from "./services/cafe-transform.service";
import { CafeValidationService } from "./services/cafe-validation.service";

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
    WinstonLoggerService,
    {
      provide: "ICafeRepository",
      useClass: CafeRepository,
    },
  ],
})
export class CafeModule {}
