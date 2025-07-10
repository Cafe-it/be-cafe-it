import { OwnerId, OwnerCredentials } from "./owner-common.dto";
import { IsUUID } from "class-validator";
import { CafeIdsArrayProperty } from "../../common/decorators/property.decorators";

export class GetOwnerByIdRequest extends OwnerId {}

export class UpdateOwnerRequest {
  @CafeIdsArrayProperty()
  cafeIds: string[];
}

export class DeleteOwnerRequest extends OwnerId {}

export class CreateOwnerRequest extends OwnerCredentials {}

export class LoginOwnerRequest extends OwnerCredentials {}
