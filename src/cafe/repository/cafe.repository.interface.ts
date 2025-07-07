import { Cafe, CafeDocument } from "../schemas/cafe.schema";

export interface ICafeRepository {
  // Basic CRUD operations
  findById(cafeId: string): Promise<CafeDocument | null>;
  create(cafe: Partial<Cafe>): Promise<CafeDocument>;
  update(cafeId: string, updates: Partial<Cafe>): Promise<CafeDocument | null>;
  delete(cafeId: string): Promise<boolean>;

  // geo queries
  findByLocation(
    lat: number,
    lng: number,
    radiusKm: number
  ): Promise<CafeDocument[]>;
}
