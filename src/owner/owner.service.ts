import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { generateRandomId } from "../common/utils/generator";
import { transformToInstance } from "../common/utils/transform";
import {
  CreateOwnerRequest,
  GetOwnerByIdRequest,
  LoginOwnerRequest,
  UpdateOwnerRequest,
} from "./dto/owner-request.dto";
import {
  GetOwnerByIdResponse,
  CreateOwnerResponse,
  OwnerResponseWithTokens,
  DeleteOwnerResponse,
} from "./dto/owner-response.dto";
import { OwnerRepository } from "./repository/owner.repository";

@Injectable()
export class OwnerService {
  constructor(
    private readonly logger: Logger,
    private readonly ownerRepository: OwnerRepository,
    private readonly authService: AuthService
  ) {}

  async getOwnerById(dto: GetOwnerByIdRequest): Promise<GetOwnerByIdResponse> {
    this.logger.log(`getOwnerById, ownerId=${dto.ownerId}`);

    const owner = await this.ownerRepository.findById(dto.ownerId);

    if (!owner) {
      throw new NotFoundException(`Owner with id ${dto.ownerId} not found`);
    }

    const result = transformToInstance(GetOwnerByIdResponse, {
      ownerId: owner.id,
      email: owner.email,
      cafeIds: owner.cafeIds,
    });

    this.logger.log(
      `Found owner=${result.ownerId} with ${result.cafeIds.length} cafes`
    );

    return result;
  }

  async createOwner(dto: CreateOwnerRequest): Promise<CreateOwnerResponse> {
    this.logger.log(`createOwner, email=${dto.email}`);

    const { email, password } = dto;

    // Check if owner already exists
    const existingOwner = await this.ownerRepository.findByEmail(email);
    if (existingOwner) {
      throw new ConflictException(`Owner with email ${email} already exists`);
    }

    const id = generateRandomId();
    const encryptedPassword = await this.authService.encryptString(password);

    const { accessToken, refreshToken, expiresIn } =
      await this.authService.generateTokens(id);

    const owner = await this.ownerRepository.create({
      id,
      email,
      password: encryptedPassword,
      token: {
        accessToken,
        expiry: new Date(Date.now() + expiresIn * 1000),
      },
      cafeIds: [],
    });

    const result = transformToInstance(CreateOwnerResponse, {
      ownerId: owner.id,
      email: owner.email,
      cafeIds: [],
      accessToken,
      refreshToken,
      expiresIn,
    });

    this.logger.log(
      `Created owner=${result.ownerId} with email=${result.email}`
    );

    return result;
  }

  async login(dto: LoginOwnerRequest): Promise<OwnerResponseWithTokens> {
    this.logger.log(`login, email=${dto.email}`);

    const { email, password } = dto;

    // Find owner by email
    const owner = await this.ownerRepository.findByEmail(email);
    if (!owner) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await this.authService.verifyString(
      password,
      owner.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Generate new tokens
    const { accessToken, refreshToken, expiresIn } =
      await this.authService.generateTokens(owner.id);

    // Update owner with new token
    const updatedOwner = await this.ownerRepository.update(owner.id, {
      ...owner.toObject(),
      token: {
        accessToken,
        expiry: new Date(Date.now() + expiresIn * 1000),
      },
    });

    if (!updatedOwner) {
      throw new NotFoundException(`Owner with id ${owner.id} not found`);
    }

    const result = transformToInstance(OwnerResponseWithTokens, {
      ownerId: updatedOwner.id,
      email: updatedOwner.email,
      cafeIds: updatedOwner.cafeIds,
      accessToken,
      refreshToken,
      expiresIn,
    });

    this.logger.log(
      `Logged in owner=${result.ownerId} with email=${result.email}`
    );

    return result;
  }

  async updateOwner(
    ownerId: string,
    updateData: UpdateOwnerRequest
  ): Promise<OwnerResponseWithTokens> {
    this.logger.log(
      `updateOwner, ownerId=${ownerId}, data=${JSON.stringify(updateData)}`
    );

    // Check if owner exists
    const existingOwner = await this.ownerRepository.findById(ownerId);
    if (!existingOwner) {
      throw new NotFoundException(`Owner with id ${ownerId} not found`);
    }

    // Update owner with new cafeIds (UUIDs as strings)
    const updatedOwner = await this.ownerRepository.update(ownerId, {
      ...existingOwner.toObject(),
      cafeIds: updateData.cafeIds,
    });

    if (!updatedOwner) {
      throw new NotFoundException(`Owner with id ${ownerId} not found`);
    }

    // Generate new tokens for updated owner
    const { accessToken, refreshToken, expiresIn } =
      await this.authService.generateTokens(updatedOwner.id);

    // Update owner with new token
    const ownerWithNewToken = await this.ownerRepository.update(ownerId, {
      ...updatedOwner.toObject(),
      token: {
        accessToken,
        expiry: new Date(Date.now() + expiresIn * 1000),
      },
    });

    if (!ownerWithNewToken) {
      throw new NotFoundException(`Owner with id ${ownerId} not found`);
    }

    const result = transformToInstance(OwnerResponseWithTokens, {
      ownerId: ownerWithNewToken.id,
      email: ownerWithNewToken.email,
      cafeIds: ownerWithNewToken.cafeIds,
      accessToken,
      refreshToken,
      expiresIn,
    });

    this.logger.log(
      `Updated owner=${result.ownerId} with ${result.cafeIds.length} cafes`
    );

    return result;
  }

  async deleteOwner(ownerId: string): Promise<DeleteOwnerResponse> {
    this.logger.log(`deleteOwner, ownerId=${ownerId}`);

    // Check if owner exists
    const existingOwner = await this.ownerRepository.findById(ownerId);
    if (!existingOwner) {
      throw new NotFoundException(`Owner with id ${ownerId} not found`);
    }

    // Delete the owner
    const success = await this.ownerRepository.delete(ownerId);

    const result = transformToInstance(DeleteOwnerResponse, {
      success,
    });

    this.logger.log(`Deleted owner=${ownerId}, success=${result.success}`);

    return result;
  }
}
