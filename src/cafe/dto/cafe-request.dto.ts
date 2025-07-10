import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import {
  Location,
  CafeId,
  StoreInformation,
  SeatAvailability,
} from "./cafe-common.dto";
import {
  RadiusProperty,
  OwnerIdProperty,
  NestedProperty,
} from "../../common/decorators/property.decorators";

export class GetNearbyCafesRequest extends Location {
  @RadiusProperty()
  radius?: number = 3; // in km
}

export class GetCafeByIdRequest extends CafeId {}
export class GetCafeSeatsByIdRequest extends CafeId {}

export class CreateCafeRequest {
  @OwnerIdProperty()
  ownerId: string;

  @NestedProperty(Location, {
    description: "Geographic location of the cafe",
  })
  location: Location;

  @NestedProperty(SeatAvailability, {
    description: "Current seat availability information",
  })
  seatAvailability: SeatAvailability;

  @NestedProperty(StoreInformation, {
    description: "Store information including name, address, and hours",
  })
  storeInformation: StoreInformation;
}

// Dedicated seat availability update request
export class UpdateCafeSeatAvailabilityRequest extends SeatAvailability {
  @OwnerIdProperty({
    description:
      "Unique identifier of the cafe owner (must match the cafe's owner)",
  })
  ownerId: string;
}

// Single flexible update request - cafeId comes from URL params, not body
export class UpdateCafeRequest extends CreateCafeRequest {}
