import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { generateRandomId } from "../../common/utils/generator";

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
export class GeoLocation {
  @Prop({ type: String, enum: ["Point"], default: "Point" })
  type: "Point";

  // [longitude, latitude]
  @Prop({ type: [Number], required: true })
  coordinates: number[];
}
const GeoLocationSchema = SchemaFactory.createForClass(GeoLocation);

/**
 * Main Cafe Schema
 */
export type CafeDocument = Cafe & Document;

@Schema({ collection: "cafes", timestamps: true })
export class Cafe {
  @Prop({ required: true, unique: true, default: generateRandomId })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: SeatAvailabilitySchema, required: true })
  seatAvailability: SeatAvailability;

  /**
   * Stand-alone geo location used for spatial queries.
   * Stored as GeoJSON Point and indexed with 2dsphere.
   */
  @Prop({ type: GeoLocationSchema, required: true })
  location: GeoLocation;

  @Prop({ required: true })
  url: string;

  /**
   * Optional flag to indicate monitoring type:
   * - false or undefined: automatic monitoring using camera (default)
   * - true: manual monitoring
   */
  @Prop({ required: false, default: false })
  isManualMonitoring?: boolean;
}

export const CafeSchema = SchemaFactory.createForClass(Cafe);

// 2dsphere index for geo queries
CafeSchema.index({ location: "2dsphere" });
