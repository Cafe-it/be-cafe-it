import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { IOwnerRepository } from "./owner.repository.interface";
import { OwnerDocument, Owner as OwnerModel } from "../schemas/owner.schema";

@Injectable()
export class OwnerRepository implements IOwnerRepository {
  constructor(
    @InjectModel(OwnerModel.name)
    private readonly ownerModel: Model<OwnerDocument>
  ) {}

  async findById(ownerId: string): Promise<OwnerDocument | null> {
    return this.ownerModel.findOne({ id: ownerId }).select({ __v: 0 }).exec();
  }

  async findByEmail(email: string): Promise<OwnerDocument | null> {
    return this.ownerModel.findOne({ email }).select({ __v: 0 }).exec();
  }

  async create(owner: Partial<OwnerModel>): Promise<OwnerDocument> {
    const created = new this.ownerModel(owner);
    return created.save();
  }

  async update(
    ownerId: string,
    updates: OwnerModel
  ): Promise<OwnerDocument | null> {
    return this.ownerModel
      .findOneAndUpdate(
        { id: ownerId },
        { $set: updates },
        {
          new: true,
          runValidators: true,
        }
      )
      .select({ __v: 0 })
      .exec();
  }

  async delete(ownerId: string): Promise<boolean> {
    const result = await this.ownerModel.deleteOne({ id: ownerId }).exec();
    return result.deletedCount > 0;
  }
}
