import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  Put,
  Delete,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  CafeGetNearbyEndpoint,
  CafeGetByIdEndpoint,
  CafeGetSeatsEndpoint,
  CafeUpdateSeatsEndpoint,
  CafeCreateEndpoint,
  CafeUpdateEndpoint,
  CafeDeleteEndpoint,
} from "../common/decorators/endpoint.decorators";
import { CafeService } from "./cafe.service";
import {
  CreateCafeRequest,
  GetCafeByIdRequest,
  GetCafeSeatsByIdRequest,
  GetNearbyCafesRequest,
  UpdateCafeRequest,
  UpdateCafeSeatAvailabilityRequest,
} from "./dto/cafe-request.dto";
import {
  CafeFullResponse,
  CafeSeatAvailabilityResponse,
} from "./dto/cafe-response.dto";

@ApiTags("cafes")
@Controller("cafes")
export class CafeController {
  constructor(private readonly cafeService: CafeService) {}

  @Get()
  @CafeGetNearbyEndpoint(CafeFullResponse)
  async getNearbyCafes(
    @Query() req: GetNearbyCafesRequest
  ): Promise<CafeFullResponse[]> {
    return this.cafeService.getNearbyCafes(req);
  }

  @Get(":cafeId")
  @CafeGetByIdEndpoint(CafeFullResponse)
  async getCafeById(
    @Param() req: GetCafeByIdRequest
  ): Promise<CafeFullResponse> {
    return this.cafeService.getCafeById(req);
  }

  @Get(":cafeId/seats-availability")
  @CafeGetSeatsEndpoint(CafeSeatAvailabilityResponse)
  async getCafeSeatsById(
    @Param() req: GetCafeSeatsByIdRequest
  ): Promise<CafeSeatAvailabilityResponse> {
    return this.cafeService.getCafeSeatsById(req);
  }

  @Put(":cafeId/seats-availability")
  @CafeUpdateSeatsEndpoint(
    CafeSeatAvailabilityResponse,
    UpdateCafeSeatAvailabilityRequest
  )
  async updateCafeSeatsById(
    @Param() { cafeId }: GetCafeByIdRequest,
    @Body() req: UpdateCafeSeatAvailabilityRequest
  ): Promise<CafeSeatAvailabilityResponse> {
    return this.cafeService.updateCafeSeatsById(cafeId, req);
  }

  @Post()
  @CafeCreateEndpoint(CafeFullResponse, CreateCafeRequest)
  async createCafe(@Body() req: CreateCafeRequest): Promise<CafeFullResponse> {
    return this.cafeService.createCafe(req);
  }

  @Put(":cafeId")
  @CafeUpdateEndpoint(CafeFullResponse, UpdateCafeRequest)
  async updateCafe(
    @Param() { cafeId }: GetCafeByIdRequest,
    @Body() req: UpdateCafeRequest
  ): Promise<CafeFullResponse> {
    return this.cafeService.updateCafe(cafeId, req);
  }

  @Delete(":cafeId")
  @CafeDeleteEndpoint(Boolean)
  async deleteCafe(@Param() { cafeId }: GetCafeByIdRequest): Promise<boolean> {
    return this.cafeService.deleteCafe(cafeId);
  }
}
