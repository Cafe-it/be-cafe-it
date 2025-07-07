import { Expose, Type } from "class-transformer";
import {
  IsBoolean,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

export class Location {
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Expose()
  @Type(() => Number)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @Expose()
  @Type(() => Number)
  lng: number;
}

export class CafeId {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  cafeId: string;
}

export class StoreLinks {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  mapUrl: string;
}
export class OperatingHours {
  @Expose()
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  endTime: string;
}

export class Amenities {
  @Expose()
  @IsString()
  noiseLevel: string;

  @Expose()
  @IsBoolean()
  hasWifi: boolean;

  @Expose()
  @IsBoolean()
  hasOutlets: boolean;
}

export class StoreInformation {
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  address: string;

  @Expose()
  @ValidateNested()
  @Type(() => OperatingHours)
  hours: OperatingHours;

  @Expose()
  @ValidateNested()
  @Type(() => StoreLinks)
  links: StoreLinks;

  @Expose()
  @ValidateNested()
  @Type(() => Amenities)
  amenities?: Amenities;
}

export class SeatAvailability {
  @Expose()
  @IsNumber()
  @Min(0)
  totalSeats: number;

  @Expose()
  @IsNumber()
  @Min(0)
  availableSeats: number;

  @Expose()
  @IsString()
  @IsISO8601()
  @IsOptional()
  lastUpdated?: string;
}
