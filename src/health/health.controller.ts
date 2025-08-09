import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOperation({
    summary: "Health check endpoint",
    description: "Returns a simple hello message to verify the API is running",
  })
  @ApiResponse({
    status: 200,
    description: "API is healthy",
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          example: "Hello! Cafe IT API is running 🚀",
        },
        timestamp: { type: "string", example: "2025-08-09T15:13:17.984Z" },
        status: { type: "string", example: "ok" },
      },
    },
  })
  getHealth() {
    return {
      message: "Hello! Cafe IT API is running 🚀",
      timestamp: new Date().toISOString(),
      status: "ok",
    };
  }
}
