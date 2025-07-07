import { Injectable } from "@nestjs/common";
import { CafeDocument, GeoLocation } from "../schemas/cafe.schema";
import {
  CafeFullResponse,
  CafeSeatAvailabilityResponse,
} from "../dto/cafe-response.dto";
import { transformToInstance } from "../../common/utils/transform";
import { Location, StoreInformation } from "../dto/cafe-common.dto";
import { getISOString } from "../../common/utils/time";
import { Cafe as CafeModel } from "../schemas/cafe.schema";

@Injectable()
export class CafeTransformService {
  /**
   * Transform CafeDocument to CafeFullResponse
   */
  toCafeFullResponse(doc: CafeDocument): CafeFullResponse {
    return transformToInstance(CafeFullResponse, {
      ...doc.toObject(),
      location: this.geoCoordinatesToLocation(doc.location),
    });
  }

  /**
   * Transform multiple CafeDocuments to CafeFullResponse array
   */
  toCafeFullResponseArray(docs: CafeDocument[]): CafeFullResponse[] {
    return docs.map((doc) => this.toCafeFullResponse(doc));
  }

  /**
   * Transform CafeDocument to CafeSeatAvailabilityResponse
   */
  toCafeSeatAvailabilityResponse(
    doc: CafeDocument
  ): CafeSeatAvailabilityResponse {
    return transformToInstance(CafeSeatAvailabilityResponse, {
      id: doc.id,
      seatAvailability: doc.seatAvailability,
    });
  }

  /**
   * Convert Location DTO to GeoJSON coordinates
   */
  locationToGeoCoordinates(
    location: Location | { lat?: number; lng?: number }
  ): GeoLocation {
    const lat = location.lat;
    const lng = location.lng;

    if (lat === undefined || lng === undefined) {
      throw new Error("Both lat and lng are required for location conversion");
    }

    return {
      type: "Point",
      coordinates: [lng, lat],
    };
  }

  /**
   * Convert GeoJSON coordinates to Location DTO
   */
  geoCoordinatesToLocation(geoLocation: GeoLocation): Location {
    return {
      lat: geoLocation.coordinates[1],
      lng: geoLocation.coordinates[0],
    };
  }

  /**
   * Create seat availability object with current timestamp
   */
  createSeatAvailabilityWithTimestamp(
    totalSeats: number,
    availableSeats: number
  ) {
    return {
      totalSeats,
      availableSeats,
      lastUpdated: getISOString(),
    };
  }

  /**
   * Transform cafe data for creation
   */
  transformCafeForCreation(data: {
    id: string;
    location: { lat: number; lng: number };
    seatAvailability: { totalSeats: number; availableSeats: number };
    storeInformation: StoreInformation;
  }): CafeModel {
    return {
      id: data.id,
      location: this.locationToGeoCoordinates(data.location),
      seatAvailability: this.createSeatAvailabilityWithTimestamp(
        data.seatAvailability.totalSeats,
        data.seatAvailability.availableSeats
      ),
      storeInformation: {
        ...data.storeInformation,
        amenities: {
          hasWifi: false,
          hasOutlets: false,
          noiseLevel: "moderate",
        },
      },
    };
  }
}
