import {
  JwtTokenProperty,
  ExpirationTimeProperty,
} from "../../common/decorators/property.decorators";

export class TokenResponse {
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

export class RefreshTokenResponse {
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
