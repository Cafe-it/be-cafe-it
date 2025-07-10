import { JwtTokenProperty } from "../../common/decorators/property.decorators";

export class RefreshTokenRequest {
  @JwtTokenProperty({
    description: "JWT refresh token",
  })
  refreshToken: string;
}
