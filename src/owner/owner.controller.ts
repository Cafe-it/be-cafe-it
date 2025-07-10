import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  OwnerGetByIdEndpoint,
  OwnerCreateEndpoint,
  OwnerLoginEndpoint,
  OwnerUpdateEndpoint,
  OwnerDeleteEndpoint,
} from "../common/decorators/endpoint.decorators";
import { OwnerService } from "./owner.service";
import {
  CreateOwnerRequest,
  DeleteOwnerRequest,
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
import { OwnerId } from "./dto/owner-common.dto";

@ApiTags("owners")
@Controller("owners")
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Get(":ownerId")
  @OwnerGetByIdEndpoint(GetOwnerByIdResponse)
  async getOwnerById(
    @Param() param: GetOwnerByIdRequest
  ): Promise<GetOwnerByIdResponse> {
    return this.ownerService.getOwnerById(param);
  }

  @Post()
  @OwnerCreateEndpoint(CreateOwnerResponse, CreateOwnerRequest)
  async createOwner(
    @Body() req: CreateOwnerRequest
  ): Promise<CreateOwnerResponse> {
    return this.ownerService.createOwner(req);
  }

  @Post("login")
  @OwnerLoginEndpoint(OwnerResponseWithTokens, LoginOwnerRequest)
  async login(
    @Body() req: LoginOwnerRequest
  ): Promise<OwnerResponseWithTokens> {
    return this.ownerService.login(req);
  }

  @Put(":ownerId")
  @OwnerUpdateEndpoint(OwnerResponseWithTokens, UpdateOwnerRequest)
  async updateOwner(
    @Param() param: OwnerId,
    @Body() dto: UpdateOwnerRequest
  ): Promise<OwnerResponseWithTokens> {
    return this.ownerService.updateOwner(param.ownerId, dto);
  }

  @Delete(":ownerId")
  @OwnerDeleteEndpoint(DeleteOwnerResponse)
  async deleteOwner(
    @Param() param: DeleteOwnerRequest
  ): Promise<DeleteOwnerResponse> {
    return this.ownerService.deleteOwner(param.ownerId);
  }
}
