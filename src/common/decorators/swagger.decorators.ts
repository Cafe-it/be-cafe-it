import { applyDecorators } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min, Max, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import {
  UuidProperty,
  NumberProperty,
  StringProperty,
  OptionalDateProperty,
} from "./property.decorators";

// Common property configurations
export const COMMON_PROPS = {
  UUID: {
    format: "uuid",
    example: "550e8400-e29b-41d4-a716-446655440000",
  },
  OWNER_UUID: {
    format: "uuid",
    example: "550e8400-e29b-41d4-a716-446655440001",
  },
  LATITUDE: {
    minimum: -90,
    maximum: 90,
    example: 37.7749,
  },
  LONGITUDE: {
    minimum: -180,
    maximum: 180,
    example: -122.4194,
  },
  TIMESTAMP: {
    format: "date-time",
    example: "2024-01-15T10:30:00.000Z",
  },
  CAFE_NAME: {
    example: "Blue Bottle Coffee",
  },
  ADDRESS: {
    example: "123 Main St, San Francisco, CA 94102",
  },
  TIME_FORMAT: {
    pattern: "^([01]\\d|2[0-3]):[0-5]\\d$",
    example: "09:00",
  },
  MAP_URL: {
    example: "https://maps.google.com/maps?q=37.7749,-122.4194",
  },
  SEAT_COUNT: {
    minimum: 0,
    example: 40,
  },
  AVAILABLE_SEATS: {
    minimum: 0,
    example: 15,
  },
  RADIUS: {
    minimum: 0.1,
    maximum: 30,
    example: 5,
    default: 3,
  },
} as const;

// Domain-specific decorator functions
export function CafeIdProperty(
  description: string = "Unique identifier of the cafe"
) {
  return UuidProperty({
    description,
    example: COMMON_PROPS.UUID.example,
  });
}

export function OwnerIdProperty(
  description: string = "Unique identifier of the cafe owner"
) {
  return UuidProperty({
    description,
    example: COMMON_PROPS.OWNER_UUID.example,
  });
}

export function LatitudeProperty(description: string = "Latitude coordinate") {
  return NumberProperty({
    description,
    example: COMMON_PROPS.LATITUDE.example,
    minimum: COMMON_PROPS.LATITUDE.minimum,
    maximum: COMMON_PROPS.LATITUDE.maximum,
  });
}

export function LongitudeProperty(
  description: string = "Longitude coordinate"
) {
  return NumberProperty({
    description,
    example: COMMON_PROPS.LONGITUDE.example,
    minimum: COMMON_PROPS.LONGITUDE.minimum,
    maximum: COMMON_PROPS.LONGITUDE.maximum,
  });
}

export function TimestampProperty(
  description: string,
  required: boolean = true
) {
  if (required) {
    return OptionalDateProperty({
      description,
      example: COMMON_PROPS.TIMESTAMP.example,
    });
  } else {
    return OptionalDateProperty({
      description,
      example: COMMON_PROPS.TIMESTAMP.example,
    });
  }
}

export function SeatCountProperty(
  description: string,
  example: number = COMMON_PROPS.SEAT_COUNT.example
) {
  return NumberProperty({
    description,
    example,
    minimum: COMMON_PROPS.SEAT_COUNT.minimum,
  });
}

export function RadiusProperty(
  description: string = "Search radius in kilometers (default: 3km)",
  required: boolean = false
) {
  const decorators = [
    ApiProperty({
      description,
      ...COMMON_PROPS.RADIUS,
      required,
    }),
    IsNumber(),
    Min(COMMON_PROPS.RADIUS.minimum),
    Max(COMMON_PROPS.RADIUS.maximum),
    Type(() => Number),
  ];

  if (!required) {
    decorators.push(IsOptional());
  }

  return applyDecorators(...decorators);
}

export function TimeFormatProperty(
  description: string,
  example: string = COMMON_PROPS.TIME_FORMAT.example
) {
  return StringProperty({
    description,
    example,
    pattern: COMMON_PROPS.TIME_FORMAT.pattern,
  });
}

export function CafeNameProperty(description: string = "Name of the cafe") {
  return StringProperty({
    description,
    example: COMMON_PROPS.CAFE_NAME.example,
  });
}

export function AddressProperty(
  description: string = "Physical address of the cafe"
) {
  return StringProperty({
    description,
    example: COMMON_PROPS.ADDRESS.example,
  });
}
