import { Expose, Type } from "class-transformer";
import {
  Location,
  SeatAvailability,
  StoreInformation,
} from "./cafe-common.dto";
import { IsUUID, ValidateNested } from "class-validator";

export class CafeFullResponse {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsUUID()
  ownerId: string;

  @Expose()
  @ValidateNested()
  @Type(() => StoreInformation)
  storeInformation: StoreInformation;

  @Expose()
  @ValidateNested()
  @Type(() => Location)
  location: Location;

  @Expose()
  @ValidateNested()
  @Type(() => SeatAvailability)
  seatAvailability: SeatAvailability;
}

export class CafeSeatAvailabilityResponse {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @Type(() => SeatAvailability)
  seatAvailability: SeatAvailability;
}
