import { Body, Controller, Logger, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthRefreshTokenEndpoint } from "../common/decorators/endpoint.decorators";
import { AuthService } from "./auth.service";
import { RefreshTokenRequest } from "./dto/auth-request.dto";
import { RefreshTokenResponse } from "./dto/auth-response.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post("refresh")
  @AuthRefreshTokenEndpoint(RefreshTokenResponse, RefreshTokenRequest)
  async refreshToken(
    @Body() refreshTokenRequest: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    return this.authService.refreshAccessToken(
      refreshTokenRequest.refreshToken
    );
  }
}
