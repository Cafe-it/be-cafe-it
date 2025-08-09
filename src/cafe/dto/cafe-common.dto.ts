import {
  UuidProperty,
  StringProperty,
  UrlProperty,
  LatitudeProperty,
  LongitudeProperty,
  SeatCountProperty,
  OptionalDateProperty,
  OptionalBooleanProperty,
} from "../../common/decorators/property.decorators";

export class Location {
  @LatitudeProperty()
  lat: number;

  @LongitudeProperty()
  lng: number;
}

export class CafeId {
  @UuidProperty({ description: "Unique identifier of the cafe" })
  cafeId: string;
}

export class SeatAvailability {
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

export class CafeBasicInfo {
  @UuidProperty({ description: "Unique identifier of the cafe" })
  cafeId: string;

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

  @OptionalBooleanProperty({
    description:
      "Whether the cafe uses manual monitoring (true) or automatic camera monitoring (false). Defaults to false (camera monitoring).",
    example: false,
  })
  isManualMonitoring?: boolean;
}
