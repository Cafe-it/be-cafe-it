import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import {
  UuidProperty,
  StringProperty,
  UrlProperty,
  BooleanProperty,
  NestedProperty,
  OptionalDateProperty,
  LatitudeProperty,
  LongitudeProperty,
  TimeProperty,
  SeatCountProperty,
  NoiseLevelProperty,
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

export class StoreLinks {
  @UrlProperty({
    description: "Google Maps or similar map service URL",
    example: "https://maps.google.com/maps?q=37.7749,-122.4194",
  })
  mapUrl: string;
}

export class OperatingHours {
  @TimeProperty({
    description: "Opening time in HH:mm format",
  })
  startTime: string;

  @TimeProperty({
    description: "Closing time in HH:mm format",
    example: "22:00",
  })
  endTime: string;
}

export class Amenities {
  @NoiseLevelProperty()
  noiseLevel: string;

  @BooleanProperty({
    description: "Whether the cafe has WiFi available",
    example: true,
  })
  hasWifi: boolean;

  @BooleanProperty({
    description: "Whether the cafe has power outlets available",
    example: true,
  })
  hasOutlets: boolean;
}

export class StoreInformation {
  @StringProperty({
    description: "Name of the cafe",
    example: "Blue Bottle Coffee",
  })
  name: string;

  @StringProperty({
    description: "Physical address of the cafe",
    example: "123 Main St, San Francisco, CA 94102",
  })
  address: string;

  @NestedProperty(OperatingHours, {
    description: "Operating hours for the cafe",
  })
  hours: OperatingHours;

  @NestedProperty(StoreLinks, {
    description: "External links for the cafe",
  })
  links: StoreLinks;

  @NestedProperty(Amenities, {
    description: "Available amenities at the cafe",
    required: false,
  })
  amenities?: Amenities;
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
