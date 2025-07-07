import { generateRandomId } from "../../common/utils/generator";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * Sub-documents
 */

@Schema({ _id: false })
class SeatAvailability {
  @Prop({ required: true })
  totalSeats: number;

  @Prop({ required: true })
  availableSeats: number;

  @Prop({ required: true, default: () => new Date().toISOString() })
  lastUpdated: string;
}
const SeatAvailabilitySchema = SchemaFactory.createForClass(SeatAvailability);

@Schema({ _id: false })
class StoreLinks {
  @Prop({ required: true })
  mapUrl: string;
}
const StoreLinksSchema = SchemaFactory.createForClass(StoreLinks);

@Schema({ _id: false })
class OperatingHours {
  @Prop({ match: /^([01]\d|2[0-3]):[0-5]\d$/ }) // HH:mm format
  startTime: string;

  @Prop({ match: /^([01]\d|2[0-3]):[0-5]\d$/ })
  endTime: string;
}
const OperatingHoursSchema = SchemaFactory.createForClass(OperatingHours);

@Schema({ _id: false })
export class GeoLocation {
  @Prop({ type: String, enum: ["Point"], default: "Point" })
  type: "Point";

  // [longitude, latitude]
  @Prop({ type: [Number], required: true })
  coordinates: number[];
}
const GeoLocationSchema = SchemaFactory.createForClass(GeoLocation);

@Schema({ _id: false })
class Amenities {
  @Prop() hasWifi: boolean;
  @Prop() hasOutlets: boolean;
  @Prop({ enum: ["quiet", "moderate", "loud"] }) noiseLevel: string;
}
const AmenitiesSchema = SchemaFactory.createForClass(Amenities);

@Schema({ _id: false })
class StoreInformation {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ type: OperatingHoursSchema }) hours: OperatingHours;
  @Prop({ type: StoreLinksSchema }) links: StoreLinks;
  @Prop({
    type: AmenitiesSchema,
    default: () => ({}),
  })
  amenities: Amenities;
}
const StoreInformationSchema = SchemaFactory.createForClass(StoreInformation);

/**
 * Main Cafe Schema
 */
export type CafeDocument = Cafe & Document;

@Schema({ collection: "cafes", timestamps: true })
export class Cafe {
  @Prop({ required: true, unique: true, default: generateRandomId })
  id: string;

  @Prop({ type: SeatAvailabilitySchema, required: true })
  seatAvailability: SeatAvailability;

  /**
   * Stand-alone geo location used for spatial queries.
   * Stored as GeoJSON Point and indexed with 2dsphere.
   */
  @Prop({ type: GeoLocationSchema, required: true })
  location: GeoLocation;

  /**
   * Optional detailed store information.
   */
  @Prop({ type: StoreInformationSchema })
  storeInformation: StoreInformation;
}

export const CafeSchema = SchemaFactory.createForClass(Cafe);

// 2dsphere index for geo queries
CafeSchema.index({ location: "2dsphere" });
