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

@Controller("cafes")
export class CafeController {
  constructor(private readonly cafeService: CafeService) {}

  // GET /cafes/?lat=12.3456&lng=78.9012&radius=3
  @Get()
  async getNearbyCafes(
    @Query() req: GetNearbyCafesRequest
  ): Promise<CafeFullResponse[]> {
    return this.cafeService.getNearbyCafes(req);
  }

  // GET /cafes/:cafeId
  @Get(":cafeId")
  async getCafeById(
    @Param() req: GetCafeByIdRequest
  ): Promise<CafeFullResponse> {
    return this.cafeService.getCafeById(req);
  }

  // GET /cafes/:cafeId/seats-availability
  @Get(":cafeId/seats-availability")
  async getCafeSeatsById(
    @Param() req: GetCafeSeatsByIdRequest
  ): Promise<CafeSeatAvailabilityResponse> {
    return this.cafeService.getCafeSeatsById(req);
  }

  // PUT /cafes/:cafeId/seats-availability
  @Put(":cafeId/seats-availability")
  async updateCafeSeatsById(
    @Param() { cafeId }: GetCafeByIdRequest,
    @Body() req: UpdateCafeSeatAvailabilityRequest
  ): Promise<CafeSeatAvailabilityResponse> {
    return this.cafeService.updateCafeSeatsById(cafeId, req);
  }

  // POST /cafes
  @Post()
  async createCafe(@Body() req: CreateCafeRequest): Promise<CafeFullResponse> {
    return this.cafeService.createCafe(req);
  }

  // PUT /cafes/:cafeId
  @Put(":cafeId")
  async updateCafe(
    @Param() { cafeId }: GetCafeByIdRequest,
    @Body() req: UpdateCafeRequest
  ): Promise<CafeFullResponse> {
    return this.cafeService.updateCafe(cafeId, req);
  }

  // DELETE /cafes/:cafeId
  @Delete(":cafeId")
  async deleteCafe(@Param() { cafeId }: GetCafeByIdRequest): Promise<boolean> {
    return this.cafeService.deleteCafe(cafeId);
  }
}
