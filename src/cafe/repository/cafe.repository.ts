import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { ICafeRepository } from "./cafe.repository.interface";
import { CafeDocument, Cafe as CafeModel } from "../schemas/cafe.schema";

@Injectable()
export class CafeRepository implements ICafeRepository {
  constructor(
    @InjectModel(CafeModel.name)
    private readonly cafeModel: Model<CafeDocument>
  ) {}

  async findById(cafeId: string): Promise<CafeDocument | null> {
    return this.cafeModel.findOne({ id: cafeId }).select({ __v: 0 }).exec();
  }

  async create(cafe: Partial<CafeModel>): Promise<CafeDocument> {
    const created = new this.cafeModel(cafe);
    return created.save();
  }

  async update(
    cafeId: string,
    updates: CafeModel
  ): Promise<CafeDocument | null> {
    return this.cafeModel
      .findOneAndUpdate(
        { id: cafeId },
        { $set: updates },
        {
          new: true,
          runValidators: true,
        }
      )
      .select({ __v: 0 })
      .exec();
  }

  async delete(cafeId: string): Promise<boolean> {
    const result = await this.cafeModel.deleteOne({ id: cafeId }).exec();
    return result.deletedCount > 0;
  }

  // geo queries
  async findByLocation(
    lat: number,
    lng: number,
    radiusKm: number
  ): Promise<CafeDocument[]> {
    const radiusMeters = radiusKm * 1000;

    return this.cafeModel
      .find({
        location: {
          $nearSphere: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: radiusMeters,
          },
        },
      })
      .select({ __v: 0 })
      .exec()
      .catch((err) => {
        console.error("Error finding cafes by location:", err);
        throw err;
      });
  }
}
