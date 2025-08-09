import { applyDecorators } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsUrl,
  IsISO8601,
  IsOptional,
  ValidateNested,
  Min,
  Max,
  IsEmail,
  IsArray,
} from "class-validator";
import { Expose, Type } from "class-transformer";

interface PropertyOptions {
  description?: string;
  example?: any;
  required?: boolean;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  format?: string;
  enum?: any[];
}

export function UuidProperty(options: PropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "UUID",
      example: options.example ?? "550e8400-e29b-41d4-a716-446655440000",
      format: "uuid",
    }),
    Expose(),
    IsString(),
    IsNotEmpty(),
    IsUUID()
  );
}

export function NestedProperty(type: any, options: PropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      type,
      description: options.description,
      required: options.required,
    }),
    Expose(),
    ValidateNested(),
    Type(() => type)
  );
}

export function StringProperty(options: PropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "String value",
      example: options.example,
      pattern: options.pattern,
    }),
    Expose(),
    IsString(),
    IsNotEmpty()
  );
}

export function NumberProperty(options: PropertyOptions = {}) {
  const decorators = [
    ApiProperty({
      description: options.description ?? "Number value",
      example: options.example,
      minimum: options.minimum,
      maximum: options.maximum,
    }),
    Expose(),
    Type(() => Number),
    IsNumber(),
  ];

  if (options.minimum !== undefined) {
    decorators.push(Min(options.minimum));
  }
  if (options.maximum !== undefined) {
    decorators.push(Max(options.maximum));
  }

  return applyDecorators(...decorators);
}

export function BooleanProperty(options: PropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "Boolean value",
      example: options.example,
    }),
    Expose(),
    IsBoolean()
  );
}

export function OptionalBooleanProperty(options: PropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "Optional boolean value",
      example: options.example,
      required: false,
    }),
    Expose(),
    IsBoolean(),
    IsOptional()
  );
}

export function UrlProperty(options: PropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "URL",
      example: options.example,
    }),
    Expose(),
    IsString(),
    IsNotEmpty(),
    IsUrl()
  );
}

export function OptionalDateProperty(options: PropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "ISO date string",
      example: options.example,
      format: "date-time",
      required: false,
    }),
    Expose(),
    IsString(),
    IsISO8601(),
    IsOptional()
  );
}

export function EnumProperty(enumValues: any[], options: PropertyOptions = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "Enum value",
      example: options.example,
      enum: enumValues,
    }),
    Expose(),
    IsString()
  );
}

// Context-specific decorators with built-in constraints
export function LatitudeProperty(options: Partial<PropertyOptions> = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "Latitude coordinate",
      example: options.example ?? 37.7749,
      minimum: -90,
      maximum: 90,
      ...options,
    }),
    Expose(),
    IsNumber(),
    Min(-90),
    Max(90),
    Type(() => Number)
  );
}

export function LongitudeProperty(options: Partial<PropertyOptions> = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "Longitude coordinate",
      example: options.example ?? -122.4194,
      minimum: -180,
      maximum: 180,
      ...options,
    }),
    Expose(),
    IsNumber(),
    Min(-180),
    Max(180),
    Type(() => Number)
  );
}

export function TimeProperty(options: Partial<PropertyOptions> = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "Time in HH:mm format",
      example: options.example ?? "09:00",
      pattern: "^([01]\\d|2[0-3]):[0-5]\\d$",
      ...options,
    }),
    Expose(),
    IsString(),
    IsNotEmpty()
  );
}

export function SeatCountProperty(options: Partial<PropertyOptions> = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "Number of seats",
      example: options.example ?? 40,
      minimum: 0,
      ...options,
    }),
    Expose(),
    IsNumber(),
    Min(0),
    Type(() => Number)
  );
}

export function NoiseLevelProperty(options: Partial<PropertyOptions> = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "Noise level of the cafe",
      example: options.example ?? "moderate",
      enum: ["quiet", "moderate", "loud"],
      ...options,
    }),
    Expose(),
    IsString()
  );
}

// Domain-specific ID properties
export function CafeIdProperty(options: Partial<PropertyOptions> = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "Unique identifier of the cafe",
      example: options.example ?? "550e8400-e29b-41d4-a716-446655440000",
      format: "uuid",
      ...options,
    }),
    Expose(),
    IsString(),
    IsNotEmpty(),
    IsUUID()
  );
}

export function OwnerIdProperty(options: Partial<PropertyOptions> = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "Unique identifier of the cafe owner",
      example: options.example ?? "550e8400-e29b-41d4-a716-446655440001",
      format: "uuid",
      ...options,
    }),
    Expose(),
    IsString(),
    IsNotEmpty(),
    IsUUID()
  );
}

export function RadiusProperty(options: Partial<PropertyOptions> = {}) {
  const decorators = [
    ApiProperty({
      description:
        options.description ?? "Search radius in kilometers (default: 3km)",
      example: options.example ?? 5,
      minimum: 0.1,
      maximum: 30,
      default: 3,
      required: false,
      ...options,
    }),
    IsNumber(),
    Min(0.1),
    Max(30),
    Type(() => Number),
  ];

  // Add IsOptional if not explicitly marked as required
  if (options.required !== true) {
    decorators.push(IsOptional());
  }

  return applyDecorators(...decorators);
}

// Owner-specific context decorators
export function EmailProperty(options: Partial<PropertyOptions> = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "Owner email address",
      example: options.example ?? "owner@example.com",
      ...options,
    }),
    Expose(),
    IsString(),
    IsNotEmpty(),
    IsEmail()
  );
}

export function PasswordProperty(options: Partial<PropertyOptions> = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "Owner password",
      example: options.example ?? "securePassword123",
      ...options,
    }),
    Expose(),
    IsString(),
    IsNotEmpty()
  );
}

export function JwtTokenProperty(options: Partial<PropertyOptions> = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "JWT token",
      example: options.example ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      ...options,
    }),
    Expose(),
    IsString(),
    IsNotEmpty()
  );
}

export function CafeIdsArrayProperty(options: Partial<PropertyOptions> = {}) {
  return applyDecorators(
    ApiProperty({
      description:
        options.description ?? "Array of cafe UUIDs owned by this owner",
      example: options.example ?? [
        "550e8400-e29b-41d4-a716-446655440000",
        "550e8400-e29b-41d4-a716-446655440001",
      ],
      type: [String],
      ...options,
    }),
    Expose(),
    IsArray(),
    IsUUID(4, { each: true })
  );
}

export function ExpirationTimeProperty(options: Partial<PropertyOptions> = {}) {
  return applyDecorators(
    ApiProperty({
      description: options.description ?? "Token expiration time in seconds",
      example: options.example ?? 900,
      ...options,
    }),
    Expose(),
    IsNumber(),
    IsNotEmpty()
  );
}

export function SuccessProperty(options: Partial<PropertyOptions> = {}) {
  return applyDecorators(
    ApiProperty({
      description:
        options.description ?? "Indicates whether the operation was successful",
      example: options.example ?? true,
      ...options,
    }),
    Expose(),
    IsBoolean(),
    IsNotEmpty()
  );
}
