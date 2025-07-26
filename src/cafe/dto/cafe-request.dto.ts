import {
  RadiusProperty,
  StringProperty,
  UrlProperty,
  LatitudeProperty,
  LongitudeProperty,
  SeatCountProperty,
} from "../../common/decorators/property.decorators";
import { Location, CafeId, SeatAvailability } from "./cafe-common.dto";

export class GetNearbyCafesRequest extends Location {
  @RadiusProperty()
  radius?: number = 3; // in km
}

export class GetCafeByIdRequest extends CafeId {}
export class GetCafeSeatsByIdRequest extends CafeId {}

export class CreateCafeRequest {
  @StringProperty({
    description: "Name of the cafe",
    example: "Blue Bottle Coffee",
  })
  name: string;

  @LatitudeProperty()
  lat: number;

  @LongitudeProperty()
  lng: number;

  @SeatCountProperty({
    description: "Total number of seats in the cafe",
  })
  totalSeats: number;

  @UrlProperty({
    description: "Map URL for the cafe location",
    example: "https://maps.google.com/maps?q=37.7749,-122.4194",
  })
  url: string;
}

// Dedicated seat availability update request
export class UpdateCafeSeatAvailabilityRequest extends SeatAvailability {}

// Single flexible update request - cafeId comes from URL params, not body
export class UpdateCafeRequest extends CreateCafeRequest {}
