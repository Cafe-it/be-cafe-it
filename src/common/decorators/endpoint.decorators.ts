import { applyDecorators, Type } from "@nestjs/common";
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import {
  ApiSuccessResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
} from "./api.decorators";

// ============================================================================
// GENERIC CRUD ENDPOINT DECORATORS
// ============================================================================

/**
 * Generic GET by ID endpoint decorator
 */
export function GetByIdEndpoint<T>(
  responseDto: Type<T>,
  options: {
    summary: string;
    description?: string;
    paramName?: string;
    paramDescription?: string;
    successMessage?: string;
    requiresAuth?: boolean;
  }
) {
  const decorators = [
    ApiOperation({
      summary: options.summary,
      description: options.description || options.summary,
    }),
    ApiParam({
      name: options.paramName || "id",
      type: "string",
      description: options.paramDescription || "Resource ID",
    }),
    ApiSuccessResponse(
      responseDto,
      options.successMessage || "Successfully retrieved resource"
    ),
    ApiNotFoundResponse("Resource"),
  ];

  if (options.requiresAuth) {
    decorators.push(ApiBearerAuth("JWT-auth"));
    decorators.push(ApiUnauthorizedResponse());
  }

  return applyDecorators(...decorators);
}

/**
 * Generic CREATE endpoint decorator
 */
export function CreateEndpoint<T, U>(
  responseDto: Type<T>,
  requestDto: Type<U>,
  options: {
    summary: string;
    description?: string;
    successMessage?: string;
    requiresAuth?: boolean;
  }
) {
  const decorators = [
    ApiOperation({
      summary: options.summary,
      description: options.description || options.summary,
    }),
    ApiBody({ type: requestDto }),
    ApiCreatedResponse(
      responseDto,
      options.successMessage || "Successfully created resource"
    ),
    ApiBadRequestResponse(),
  ];

  if (options.requiresAuth) {
    decorators.push(ApiBearerAuth("JWT-auth"));
    decorators.push(ApiUnauthorizedResponse());
  }

  return applyDecorators(...decorators);
}

/**
 * Generic UPDATE endpoint decorator
 */
export function UpdateEndpoint<T, U>(
  responseDto: Type<T>,
  requestDto: Type<U>,
  options: {
    summary: string;
    description?: string;
    paramName?: string;
    paramDescription?: string;
    successMessage?: string;
    requiresAuth?: boolean;
    ownerOnly?: boolean;
  }
) {
  const decorators = [
    ApiOperation({
      summary: options.summary,
      description: options.description || options.summary,
    }),
    ApiParam({
      name: options.paramName || "id",
      type: "string",
      description: options.paramDescription || "Resource ID",
    }),
    ApiBody({ type: requestDto }),
    ApiSuccessResponse(
      responseDto,
      options.successMessage || "Successfully updated resource"
    ),
    ApiBadRequestResponse(),
    ApiNotFoundResponse("Resource"),
  ];

  if (options.requiresAuth) {
    decorators.push(ApiBearerAuth("JWT-auth"));
    decorators.push(ApiUnauthorizedResponse());

    if (options.ownerOnly) {
      decorators.push(
        ApiForbiddenResponse("Forbidden - not the resource owner")
      );
    }
  }

  return applyDecorators(...decorators);
}

/**
 * Generic DELETE endpoint decorator
 */
export function DeleteEndpoint<T>(
  responseDto: Type<T>,
  options: {
    summary: string;
    description?: string;
    paramName?: string;
    paramDescription?: string;
    successMessage?: string;
    requiresAuth?: boolean;
  }
) {
  const decorators = [
    ApiOperation({
      summary: options.summary,
      description: options.description || options.summary,
    }),
    ApiParam({
      name: options.paramName || "id",
      type: "string",
      description: options.paramDescription || "Resource ID",
    }),
    ApiSuccessResponse(
      responseDto,
      options.successMessage || "Successfully deleted resource"
    ),
    ApiNotFoundResponse("Resource"),
  ];

  if (options.requiresAuth) {
    decorators.push(ApiBearerAuth("JWT-auth"));
    decorators.push(ApiUnauthorizedResponse());
  }

  return applyDecorators(...decorators);
}

/**
 * Generic LOGIN endpoint decorator
 */
export function LoginEndpoint<T, U>(
  responseDto: Type<T>,
  requestDto: Type<U>,
  options: {
    summary: string;
    description?: string;
    successMessage?: string;
  }
) {
  return applyDecorators(
    ApiOperation({
      summary: options.summary,
      description: options.description || options.summary,
    }),
    ApiBody({ type: requestDto }),
    ApiSuccessResponse(
      responseDto,
      options.successMessage || "Login successful"
    ),
    ApiUnauthorizedResponse()
  );
}

// ============================================================================
// DOMAIN-SPECIFIC ENDPOINT DECORATORS
// ============================================================================

/**
 * Cafe-specific endpoint decorators
 */
export function CafeGetByIdEndpoint<T>(responseDto: Type<T>) {
  return GetByIdEndpoint(responseDto, {
    summary: "Get cafe by ID",
    description: "Retrieve detailed information about a specific cafe",
    paramName: "cafeId",
    paramDescription: "Cafe UUID",
    successMessage: "Successfully retrieved cafe details",
  });
}

export function CafeCreateEndpoint<T, U>(
  responseDto: Type<T>,
  requestDto: Type<U>
) {
  return CreateEndpoint(responseDto, requestDto, {
    summary: "Create a new cafe",
    description:
      "Create a new cafe with location, seat availability, and store information",
    successMessage: "Successfully created cafe",
    requiresAuth: true,
  });
}

export function CafeUpdateEndpoint<T, U>(
  responseDto: Type<T>,
  requestDto: Type<U>
) {
  return UpdateEndpoint(responseDto, requestDto, {
    summary: "Update cafe",
    description:
      "Update cafe information including location, seats, and store details (owner only)",
    paramName: "cafeId",
    paramDescription: "Cafe UUID",
    successMessage: "Successfully updated cafe",
    requiresAuth: true,
    ownerOnly: true,
  });
}

export function CafeDeleteEndpoint<T>(responseDto: Type<T>) {
  return DeleteEndpoint(responseDto, {
    summary: "Delete cafe",
    description: "Delete a cafe from the system",
    paramName: "cafeId",
    paramDescription: "Cafe UUID",
    successMessage: "Successfully deleted cafe",
    requiresAuth: true,
  });
}

export function CafeGetSeatsEndpoint<T>(responseDto: Type<T>) {
  return GetByIdEndpoint(responseDto, {
    summary: "Get cafe seat availability",
    description: "Retrieve current seat availability for a specific cafe",
    paramName: "cafeId",
    paramDescription: "Cafe UUID",
    successMessage: "Successfully retrieved seat availability",
  });
}

export function CafeUpdateSeatsEndpoint<T, U>(
  responseDto: Type<T>,
  requestDto: Type<U>
) {
  return UpdateEndpoint(responseDto, requestDto, {
    summary: "Update cafe seat availability",
    description: "Update the current seat availability for a cafe (owner only)",
    paramName: "cafeId",
    paramDescription: "Cafe UUID",
    successMessage: "Successfully updated seat availability",
    requiresAuth: true,
    ownerOnly: true,
  });
}

export function CafeGetNearbyEndpoint<T>(responseDto: Type<T>) {
  return applyDecorators(
    ApiOperation({
      summary: "Get nearby cafes",
      description: "Find cafes within a specified radius of given coordinates",
    }),
    ApiQuery({ name: "lat", type: "number", description: "Latitude" }),
    ApiQuery({ name: "lng", type: "number", description: "Longitude" }),
    ApiQuery({
      name: "radius",
      type: "number",
      description: "Search radius in kilometers",
    }),
    ApiSuccessResponse(responseDto, "Successfully retrieved nearby cafes"),
    ApiBadRequestResponse()
  );
}

/**
 * Owner-specific endpoint decorators
 */
export function OwnerGetByIdEndpoint<T>(responseDto: Type<T>) {
  return GetByIdEndpoint(responseDto, {
    summary: "Get owner by ID",
    description: "Retrieve owner information and associated cafes",
    paramName: "ownerId",
    paramDescription: "Owner UUID",
    successMessage: "Owner found successfully",
    requiresAuth: true,
  });
}

export function OwnerCreateEndpoint<T, U>(
  responseDto: Type<T>,
  requestDto: Type<U>
) {
  return applyDecorators(
    ApiOperation({
      summary: "Create new owner",
      description: "Register a new cafe owner account",
    }),
    ApiBody({ type: requestDto }),
    ApiCreatedResponse(responseDto, "Owner created successfully"),
    ApiBadRequestResponse(),
    ApiConflictResponse("Owner with email already exists")
  );
}

export function OwnerLoginEndpoint<T, U>(
  responseDto: Type<T>,
  requestDto: Type<U>
) {
  return LoginEndpoint(responseDto, requestDto, {
    summary: "Login owner",
    description: "Authenticate owner and receive access tokens",
    successMessage: "Login successful",
  });
}

export function OwnerUpdateEndpoint<T, U>(
  responseDto: Type<T>,
  requestDto: Type<U>
) {
  return UpdateEndpoint(responseDto, requestDto, {
    summary: "Update owner",
    description: "Update owner information and associated cafes",
    paramName: "ownerId",
    paramDescription: "Owner UUID",
    successMessage: "Owner updated successfully",
    requiresAuth: true,
  });
}

export function OwnerDeleteEndpoint<T>(responseDto: Type<T>) {
  return DeleteEndpoint(responseDto, {
    summary: "Delete owner",
    description: "Delete owner account and associated data",
    paramName: "ownerId",
    paramDescription: "Owner UUID",
    successMessage: "Owner deleted successfully",
    requiresAuth: true,
  });
}

/**
 * Auth-specific endpoint decorators
 */
export function AuthRefreshTokenEndpoint<T, U>(
  responseDto: Type<T>,
  requestDto: Type<U>
) {
  return applyDecorators(
    ApiOperation({
      summary: "Refresh access token",
      description: "Generate a new access token using a valid refresh token",
    }),
    ApiBody({ type: requestDto }),
    ApiSuccessResponse(responseDto, "Token refreshed successfully"),
    ApiUnauthorizedResponse()
  );
}
