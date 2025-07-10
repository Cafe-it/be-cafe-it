import { Body, Controller, Logger, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RefreshTokenRequest } from "./dto/auth-request.dto";
import { RefreshTokenResponse } from "./dto/auth-response.dto";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post("refresh")
  async refreshToken(
    @Body() refreshTokenRequest: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    return this.authService.refreshAccessToken(
      refreshTokenRequest.refreshToken
    );
  }
}
