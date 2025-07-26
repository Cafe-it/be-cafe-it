import { Injectable, Inject, Logger } from "@nestjs/common";
import { generateRandomId } from "../common/utils/generator";
import { ICafeRepository } from "./repository/cafe.repository.interface";
import { CafeTransformService } from "./services/cafe-transform.service";
import { CafeValidationService } from "./services/cafe-validation.service";
import {
  GetCafeByIdRequest,
  GetNearbyCafesRequest,
  GetCafeSeatsByIdRequest,
  CreateCafeRequest,
  UpdateCafeRequest,
  UpdateCafeSeatAvailabilityRequest,
} from "./dto/cafe-request.dto";
import {
  CafeFullResponse,
  CafeSeatAvailabilityResponse,
} from "./dto/cafe-response.dto";

@Injectable()
export class CafeService {
  constructor(
    @Inject("ICafeRepository")
    private readonly cafeRepository: ICafeRepository,
    private readonly transformService: CafeTransformService,
    private readonly validationService: CafeValidationService,
    private readonly logger: Logger
  ) {}

  async getNearbyCafes(
    dto: GetNearbyCafesRequest
  ): Promise<CafeFullResponse[]> {
    this.logger.log(`getNearbyCafes, params=${JSON.stringify(dto)}`);

    const { lat, lng, radius } = dto;

    const cafes = await this.cafeRepository.findByLocation(lat, lng, radius);
    const result = this.transformService.toCafeFullResponseArray(cafes);

    this.logger.log(
      `Found cafes=${result
        .map((cafe) => `${cafe.id}:${cafe.lat},${cafe.lng}`)
        .join("; ")}`
    );

    return result;
  }

  async getCafeById(dto: GetCafeByIdRequest): Promise<CafeFullResponse> {
    this.logger.log(`getCafeById, params=${JSON.stringify(dto)}`);

    const { cafeId } = dto;

    const cafe = await this.cafeRepository.findById(cafeId);
    this.validationService.validateCafeExists(cafe, cafeId);

    const result = this.transformService.toCafeFullResponse(cafe);

    this.logger.log(
      `Found cafe=${result.id}:${result.name} at ${result.lat},${result.lng}`
    );

    return result;
  }

  async getCafeSeatsById(
    dto: GetCafeSeatsByIdRequest
  ): Promise<CafeSeatAvailabilityResponse> {
    this.logger.log(`getCafeSeatsById, params=${JSON.stringify(dto)}`);

    const { cafeId } = dto;

    const cafe = await this.cafeRepository.findById(cafeId);
    this.validationService.validateCafeExists(cafe, cafeId);

    const result = this.transformService.toCafeSeatAvailabilityResponse(cafe);

    this.logger.log(
      `Found seats for cafe=${result.id}: ${result.availableSeats}/${result.totalSeats} available`
    );

    return result;
  }

  async updateCafeSeatsById(
    cafeId: string,
    dto: UpdateCafeSeatAvailabilityRequest
  ): Promise<CafeSeatAvailabilityResponse> {
    this.logger.log(
      `updateCafeSeatsById, cafeId=${cafeId}, params=${JSON.stringify(dto)}`
    );

    const { totalSeats, availableSeats } = dto;

    const existingCafe = await this.cafeRepository.findById(cafeId);
    this.validationService.validateCafeExists(existingCafe, cafeId);

    // Validate seat availability logic
    this.validationService.validateSeatAvailability(totalSeats, availableSeats);

    const seatAvailability =
      this.transformService.createSeatAvailabilityWithTimestamp(
        totalSeats,
        availableSeats
      );

    const updatedCafe = await this.cafeRepository.update(cafeId, {
      seatAvailability,
    });
    this.validationService.validateCafeExists(updatedCafe, cafeId);

    const result =
      this.transformService.toCafeSeatAvailabilityResponse(updatedCafe);

    this.logger.log(
      `Updated seats for cafe=${result.id}: ${result.availableSeats}/${result.totalSeats} available`
    );

    return result;
  }

  async createCafe(dto: CreateCafeRequest): Promise<CafeFullResponse> {
    this.logger.log(`createCafe, params=${JSON.stringify(dto)}`);

    this.validationService.validateCreateCafeRequest(dto);
    const id = generateRandomId();
    const cafeData = this.transformService.transformCafeForCreation({
      ...dto,
      id,
    });

    const createdCafe = await this.cafeRepository.create(cafeData);
    const result = this.transformService.toCafeFullResponse(createdCafe);

    this.logger.log(
      `Created cafe=${result.id}:${result.name} at ${result.lat},${result.lng}`
    );

    return result;
  }

  async updateCafe(
    cafeId: string,
    dto: UpdateCafeRequest
  ): Promise<CafeFullResponse> {
    this.logger.log(
      `updateCafe, cafeId=${cafeId}, params=${JSON.stringify(dto)}`
    );

    this.validationService.validateUpdateCafeRequest(dto);

    // Get existing cafe to ensure it exists
    const existingCafe = await this.cafeRepository.findById(cafeId);
    this.validationService.validateCafeExists(existingCafe, cafeId);

    const cafeData = this.transformService.transformCafeForCreation({
      ...dto,
      id: cafeId,
    });

    const updatedCafe = await this.cafeRepository.update(cafeId, cafeData);
    this.validationService.validateCafeExists(updatedCafe, cafeId);

    const result = this.transformService.toCafeFullResponse(updatedCafe);

    this.logger.log(
      `Updated cafe=${result.id}:${result.name} at ${result.lat},${result.lng}`
    );

    return result;
  }

  async deleteCafe(cafeId: string): Promise<boolean> {
    this.logger.log(`deleteCafe, cafeId=${cafeId}`);

    const cafe = await this.cafeRepository.findById(cafeId);
    this.validationService.validateCafeExists(cafe, cafeId);

    const result = await this.cafeRepository.delete(cafeId);

    this.logger.log(`Deleted cafe=${cafeId}, success=${result}`);

    return result;
  }
}
