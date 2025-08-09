import { Injectable } from "@nestjs/common";
import { CafeDocument, GeoLocation } from "../schemas/cafe.schema";
import {
  CafeFullResponse,
  CafeSeatAvailabilityResponse,
} from "../dto/cafe-response.dto";
import { transformToInstance } from "../../common/utils/transform";
import { Location } from "../dto/cafe-common.dto";
import { getISOString } from "../../common/utils/time";
import { Cafe as CafeModel } from "../schemas/cafe.schema";
import { CreateCafeRequest } from "../dto/cafe-request.dto";

@Injectable()
export class CafeTransformService {
  /**
   * Transform CafeDocument to CafeFullResponse
   */
  toCafeFullResponse(doc: CafeDocument): CafeFullResponse {
    const geoLocation = this.geoCoordinatesToLocation(doc.location);

    return transformToInstance(CafeFullResponse, {
      id: doc.id,
      name: doc.name,
      lat: geoLocation.lat,
      lng: geoLocation.lng,
      totalSeats: doc.seatAvailability.totalSeats,
      availableSeats: doc.seatAvailability.availableSeats,
      lastUpdated: doc.seatAvailability.lastUpdated,
      url: doc.url,
      isManualMonitoring: doc.isManualMonitoring ?? false,
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
      totalSeats: doc.seatAvailability.totalSeats,
      availableSeats: doc.seatAvailability.availableSeats,
      lastUpdated: doc.seatAvailability.lastUpdated,
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
  transformCafeForCreation(
    data: CreateCafeRequest & { id: string }
  ): CafeModel {
    return {
      id: data.id,
      name: data.name,
      location: this.locationToGeoCoordinates({ lat: data.lat, lng: data.lng }),
      seatAvailability: this.createSeatAvailabilityWithTimestamp(
        data.totalSeats,
        0 // Initially no seats are available
      ),
      url: data.url,
      isManualMonitoring: data.isManualMonitoring ?? false,
    };
  }
}
