import { Injectable, Logger } from "@nestjs/common";

export interface MapUrlResult {
  type: "coordinates" | "place_id";
  lat?: number;
  lng?: number;
  placeId?: string;
  source: "google" | "naver" | "unknown";
  originalUrl: string;
}

@Injectable()
export class MapUrlService {
  private readonly logger = new Logger(MapUrlService.name);

  async extractFromMapUrl(url: string): Promise<MapUrlResult> {
    this.logger.log(`Processing URL: ${url}`);

    // Google Maps URL patterns
    if (this.isGoogleMapsUrl(url)) {
      const coordinates = this.extractGoogleCoordinates(url);
      if (coordinates) {
        return {
          type: "coordinates",
          lat: coordinates.lat,
          lng: coordinates.lng,
          source: "google",
          originalUrl: url,
        };
      }
    }

    // Naver Maps URL patterns
    if (this.isNaverMapsUrl(url)) {
      const placeId = this.extractNaverPlaceId(url);
      if (placeId) {
        return {
          type: "place_id",
          placeId,
          source: "naver",
          originalUrl: url,
        };
      }
    }

    return {
      type: "coordinates",
      source: "unknown",
      originalUrl: url,
    };
  }

  private isGoogleMapsUrl(url: string): boolean {
    return url.includes("google.com/maps") || url.includes("maps.google.com");
  }

  private isNaverMapsUrl(url: string): boolean {
    return url.includes("map.naver.com");
  }

  private extractGoogleCoordinates(
    url: string
  ): { lat: number; lng: number } | null {
    // Pattern 1: @lat,lng,zoom
    let match = /@(-?\d+\.\d+),(-?\d+\.\d+)(?:,|\b)/.exec(url);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    // Pattern 2: !3dlat!4dlng
    match = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/.exec(url);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    // Pattern 3: q=lat,lng
    match = /[?&#]q=(-?\d+\.\d+),(-?\d+\.\d+)(?:&|$)/.exec(url);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    // Pattern 4: ll=lat,lng
    match = /[?&#]ll=(-?\d+\.\d+),(-?\d+\.\d+)(?:&|$)/.exec(url);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    // Pattern 5: center=lat,lng
    match = /[?&#]center=(-?\d+\.\d+),(-?\d+\.\d+)(?:&|$)/.exec(url);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    this.logger.warn(`Could not extract coordinates from Google URL: ${url}`);
    return null;
  }

  private extractNaverPlaceId(url: string): string | null {
    // Pattern: /place/[placeId]
    const match = /\/place\/(\d+)/.exec(url);
    if (match) {
      this.logger.log(`Extracted Naver place ID: ${match[1]}`);
      return match[1];
    }

    this.logger.warn(`Could not extract place ID from Naver URL: ${url}`);
    return null;
  }
}
