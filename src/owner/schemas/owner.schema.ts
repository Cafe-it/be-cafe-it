import { generateRandomId } from "../../common/utils/generator";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

/**
 * Sub-documents
 */

@Schema({ _id: false })
class Token {
  @Prop({ required: true })
  accessToken: string;

  @Prop({ required: true })
  expiry: Date;
}
const TokenSchema = SchemaFactory.createForClass(Token);

/**
 * Main Owner Schema
 */
export type OwnerDocument = Owner & Document;

@Schema({ collection: "owners", timestamps: true })
export class Owner {
  @Prop({ required: true, unique: true, default: generateRandomId })
  id: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: TokenSchema, default: null })
  token: Token;

  @Prop({ type: [String], default: [] })
  cafeIds: string[];
}

export const OwnerSchema = SchemaFactory.createForClass(Owner);

// Create unique index on email
OwnerSchema.index({ email: 1 }, { unique: true });
