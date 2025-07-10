import {
  IsBoolean,
  IsEmail,
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
} from "class-validator";
import { OwnerId } from "./owner-common.dto";
import { Expose } from "class-transformer";

export class OwnerCommonResponse extends OwnerId {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  cafeIds: string[];
}

export class OwnerResponseWithTokens extends OwnerCommonResponse {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  expiresIn: number;
}

export class GetOwnerByIdResponse extends OwnerCommonResponse {}
export class UpdateOwnerResponse extends OwnerResponseWithTokens {}
export class CreateOwnerResponse extends OwnerResponseWithTokens {}
export class DeleteOwnerResponse {
  @Expose()
  @IsBoolean()
  @IsNotEmpty()
  @IsBoolean()
  success: boolean;
}
