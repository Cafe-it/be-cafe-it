import { applyDecorators } from "@nestjs/common";
import {
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiOperation,
  ApiBearerAuth,
} from "@nestjs/swagger";

// Common API Response decorators
export function ApiSuccessResponse(type?: any, description?: string) {
  return ApiResponse({
    status: 200,
    description: description ?? "Operation successful",
    type,
  });
}

export function ApiCreatedResponse(type?: any, description?: string) {
  return ApiResponse({
    status: 201,
    description: description ?? "Resource created successfully",
    type,
  });
}

export function ApiBadRequestResponse(message?: string) {
  return ApiResponse({
    status: 400,
    description: "Bad request - validation error",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 400 },
        code: { type: "string", example: "BAD_REQUEST" },
        message: {
          type: "string",
          example: message ?? "Invalid request data",
        },
      },
    },
  });
}

export function ApiUnauthorizedResponse(message?: string) {
  return ApiResponse({
    status: 401,
    description: "Unauthorized",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 401 },
        code: { type: "string", example: "UNAUTHORIZED" },
        message: {
          type: "string",
          example: message ?? "Unauthorized - invalid or missing JWT token",
        },
      },
    },
  });
}

export function ApiForbiddenResponse(message?: string) {
  return ApiResponse({
    status: 403,
    description: "Forbidden",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 403 },
        code: { type: "string", example: "FORBIDDEN" },
        message: {
          type: "string",
          example: message ?? "Forbidden - insufficient permissions",
        },
      },
    },
  });
}

export function ApiNotFoundResponse(resource?: string) {
  return ApiResponse({
    status: 404,
    description: `${resource ?? "Resource"} not found`,
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 404 },
        code: { type: "string", example: "NOT_FOUND" },
        message: {
          type: "string",
          example: `${resource ?? "Resource"} not found`,
        },
      },
    },
  });
}

export function ApiConflictResponse(message?: string) {
  return ApiResponse({
    status: 409,
    description: "Conflict",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 409 },
        code: { type: "string", example: "CONFLICT" },
        message: {
          type: "string",
          example: message ?? "Resource already exists",
        },
      },
    },
  });
}

// Common API Parameter decorators
export function ApiCafeIdParam() {
  return ApiParam({
    name: "cafeId",
    description: "Unique identifier of the cafe",
    example: "550e8400-e29b-41d4-a716-446655440000",
    format: "uuid",
  });
}

export function ApiOwnerIdParam() {
  return ApiParam({
    name: "ownerId",
    description: "Unique identifier of the owner",
    example: "550e8400-e29b-41d4-a716-446655440001",
    format: "uuid",
  });
}

// Common API Query decorators
export function ApiCoordinateQueries() {
  return applyDecorators(
    ApiQuery({
      name: "lat",
      description: "Latitude coordinate",
      example: 37.7749,
      type: Number,
    }),
    ApiQuery({
      name: "lng",
      description: "Longitude coordinate",
      example: -122.4194,
      type: Number,
    })
  );
}

export function ApiRadiusQuery() {
  return ApiQuery({
    name: "radius",
    description: "Search radius in kilometers (default: 3km, max: 30km)",
    example: 5,
    type: Number,
    required: false,
  });
}

// Context-specific API operation decorators
export function ApiGetOperation(summary: string, description?: string) {
  return ApiOperation({
    summary,
    description: description ?? summary,
  });
}

export function ApiPostOperation(summary: string, description?: string) {
  return ApiOperation({
    summary,
    description: description ?? summary,
  });
}

export function ApiPutOperation(summary: string, description?: string) {
  return ApiOperation({
    summary,
    description: description ?? summary,
  });
}

export function ApiDeleteOperation(summary: string, description?: string) {
  return ApiOperation({
    summary,
    description: description ?? summary,
  });
}

// Combined decorators for common patterns
export function ApiAuthenticatedOperation(
  summary: string,
  description?: string
) {
  return applyDecorators(
    ApiOperation({
      summary,
      description: description ?? summary,
    }),
    ApiBearerAuth("JWT-auth")
  );
}

export function ApiCafeOperation(summary: string, description?: string) {
  return applyDecorators(
    ApiGetOperation(summary, description),
    ApiCafeIdParam(),
    ApiSuccessResponse(),
    ApiNotFoundResponse("Cafe")
  );
}

export function ApiOwnerOperation(summary: string, description?: string) {
  return applyDecorators(
    ApiGetOperation(summary, description),
    ApiOwnerIdParam(),
    ApiBearerAuth("JWT-auth"),
    ApiSuccessResponse(),
    ApiNotFoundResponse("Owner")
  );
}

export function ApiCrudResponses() {
  return applyDecorators(
    ApiBadRequestResponse(),
    ApiUnauthorizedResponse(),
    ApiForbiddenResponse(),
    ApiNotFoundResponse()
  );
}

export function ApiAuthResponses() {
  return applyDecorators(ApiUnauthorizedResponse(), ApiBadRequestResponse());
}

// Specific operation decorators
export function ApiGetNearbyCafesOperation(responseType?: any) {
  return applyDecorators(
    ApiGetOperation(
      "Get nearby cafes",
      "Retrieve cafes within a specified radius from given coordinates"
    ),
    ApiCoordinateQueries(),
    ApiRadiusQuery(),
    ApiResponse({
      status: 200,
      description: "Successfully retrieved nearby cafes",
      type: responseType ? [responseType] : undefined,
    }),
    ApiBadRequestResponse("Invalid query parameters")
  );
}

export function ApiRefreshTokenOperation(responseType?: any) {
  return applyDecorators(
    ApiPostOperation("Refresh access token"),
    ApiSuccessResponse(responseType, "Token refreshed successfully"),
    ApiUnauthorizedResponse("Invalid refresh token"),
    ApiBadRequestResponse("refreshToken should not be empty")
  );
}

export function ApiLoginOperation(responseType?: any) {
  return applyDecorators(
    ApiPostOperation("Login owner"),
    ApiSuccessResponse(responseType, "Login successful"),
    ApiUnauthorizedResponse("Invalid credentials")
  );
}

export function ApiCreateOwnerOperation(responseType?: any) {
  return applyDecorators(
    ApiPostOperation("Create new owner"),
    ApiCreatedResponse(responseType, "Owner created successfully"),
    ApiConflictResponse("Owner with email already exists")
  );
}
