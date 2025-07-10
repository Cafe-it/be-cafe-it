import { OwnerId } from "./owner-common.dto";
import {
  EmailProperty,
  CafeIdsArrayProperty,
  JwtTokenProperty,
  ExpirationTimeProperty,
  SuccessProperty,
} from "../../common/decorators/property.decorators";

export class OwnerCommonResponse extends OwnerId {
  @EmailProperty()
  email: string;

  @CafeIdsArrayProperty()
  cafeIds: string[];
}

export class OwnerResponseWithTokens extends OwnerCommonResponse {
  @JwtTokenProperty({
    description: "JWT access token",
  })
  accessToken: string;

  @JwtTokenProperty({
    description: "JWT refresh token",
  })
  refreshToken: string;

  @ExpirationTimeProperty()
  expiresIn: number;
}

export class GetOwnerByIdResponse extends OwnerCommonResponse {}
export class UpdateOwnerResponse extends OwnerResponseWithTokens {}
export class CreateOwnerResponse extends OwnerResponseWithTokens {}
export class DeleteOwnerResponse {
  @SuccessProperty({
    description: "Indicates whether the deletion was successful",
  })
  success: boolean;
}
