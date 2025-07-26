import {
  CafeIdProperty,
  StringProperty,
  UrlProperty,
  LatitudeProperty,
  LongitudeProperty,
  SeatCountProperty,
  OptionalDateProperty,
} from "../../common/decorators/property.decorators";

export class CafeFullResponse {
  @CafeIdProperty()
  id: string;

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

  @SeatCountProperty({
    description: "Number of currently available seats",
    example: 15,
  })
  availableSeats: number;

  @OptionalDateProperty({
    description: "ISO timestamp of when seat availability was last updated",
    example: "2024-01-15T10:30:00.000Z",
  })
  lastUpdated?: string;

  @UrlProperty({
    description: "Map URL for the cafe location",
    example: "https://maps.google.com/maps?q=37.7749,-122.4194",
  })
  url: string;
}

export class CafeSeatAvailabilityResponse {
  @CafeIdProperty()
  id: string;

  @SeatCountProperty({
    description: "Total number of seats in the cafe",
  })
  totalSeats: number;

  @SeatCountProperty({
    description: "Number of currently available seats",
    example: 15,
  })
  availableSeats: number;

  @OptionalDateProperty({
    description: "ISO timestamp of when seat availability was last updated",
    example: "2024-01-15T10:30:00.000Z",
  })
  lastUpdated?: string;
}
