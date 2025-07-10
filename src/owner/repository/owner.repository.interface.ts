import { Owner, OwnerDocument } from "../schemas/owner.schema";

export interface IOwnerRepository {
  findById(ownerId: string): Promise<OwnerDocument | null>;
  findByEmail(email: string): Promise<OwnerDocument | null>;
  create(owner: Partial<Owner>): Promise<OwnerDocument>;
  update(
    ownerId: string,
    updates: Partial<Owner>
  ): Promise<OwnerDocument | null>;
  delete(ownerId: string): Promise<boolean>;
}
