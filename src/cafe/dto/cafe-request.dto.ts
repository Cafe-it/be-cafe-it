import { Type } from "class-transformer";
import {
  IsNumber,
  Min,
  Max,
  ValidateNested,
  IsString,
  IsNotEmpty,
  IsUUID,
} from "class-validator";
import {
  Location,
  CafeId,
  StoreInformation,
  SeatAvailability,
} from "./cafe-common.dto";

export class GetNearbyCafesRequest extends Location {
  @IsNumber()
  @Min(0.1)
  @Max(30)
  @Type(() => Number)
  radius?: number = 3; // in km
}

export class GetCafeByIdRequest extends CafeId {}
export class GetCafeSeatsByIdRequest extends CafeId {}

export class CreateCafeRequest {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  ownerId: string;

  @ValidateNested()
  @Type(() => Location)
  location: Location;

  @ValidateNested()
  @Type(() => SeatAvailability)
  seatAvailability: SeatAvailability;

  @ValidateNested()
  @Type(() => StoreInformation)
  storeInformation: StoreInformation;
}

// Dedicated seat availability update request
export class UpdateCafeSeatAvailabilityRequest extends SeatAvailability {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  ownerId: string;
}

// Single flexible update request - cafeId comes from URL params, not body
export class UpdateCafeRequest extends CreateCafeRequest {}
