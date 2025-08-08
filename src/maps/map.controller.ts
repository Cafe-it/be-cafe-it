import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { MapUrlService, MapUrlResult } from "./map.service";

@ApiTags("maps")
@Controller("maps")
export class MapController {
  constructor(private readonly mapUrlService: MapUrlService) {}

  @Get("extract")
  @ApiOperation({ summary: "Extract coordinates or place ID from map URL" })
  @ApiQuery({
    name: "url",
    type: String,
    description: "Map URL (Google/Naver)",
  })
  async extractFromUrl(@Query("url") url: string): Promise<MapUrlResult> {
    return this.mapUrlService.extractFromMapUrl(url);
  }
}
