import { Module } from "@nestjs/common";
import { MapController } from "./map.controller";
import { MapUrlService } from "./map.service";

@Module({
  imports: [],
  controllers: [MapController],
  providers: [MapUrlService],
  exports: [MapUrlService],
})
export class MapModule {}
