import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class OwnerId {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  ownerId: string;
}

export class OwnerCredentials {
  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  password: string;
}
