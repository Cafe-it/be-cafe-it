import { Expose, Type } from "class-transformer";
import {
  Location,
  SeatAvailability,
  StoreInformation,
} from "./cafe-common.dto";
import { ValidateNested } from "class-validator";

export class CafeFullResponse {
  @Expose()
  id: string;

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
  id: string;

  @Expose()
  @Type(() => SeatAvailability)
  seatAvailability: SeatAvailability;
}
