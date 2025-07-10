import { Expose } from "class-transformer";
import { OwnerId, OwnerCredentials } from "./owner-common.dto";
import { IsArray, IsString, IsUUID } from "class-validator";

export class GetOwnerByIdRequest extends OwnerId {}
export class UpdateOwnerRequest {
  @Expose()
  @IsArray()
  @IsUUID(4, { each: true })
  cafeIds: string[];
}
export class DeleteOwnerRequest extends OwnerId {}
export class CreateOwnerRequest extends OwnerCredentials {}
export class LoginOwnerRequest extends OwnerCredentials {}
