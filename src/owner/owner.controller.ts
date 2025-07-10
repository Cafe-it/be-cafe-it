import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
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

@Controller("owners")
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  // GET /owners/:ownerId
  @Get(":ownerId")
  async getOwnerById(
    @Param() param: GetOwnerByIdRequest
  ): Promise<GetOwnerByIdResponse> {
    return this.ownerService.getOwnerById(param);
  }

  // POST /owners
  @Post()
  async createOwner(
    @Body() req: CreateOwnerRequest
  ): Promise<CreateOwnerResponse> {
    return this.ownerService.createOwner(req);
  }

  // POST /owners/login
  @Post("login")
  async login(
    @Body() req: LoginOwnerRequest
  ): Promise<OwnerResponseWithTokens> {
    return this.ownerService.login(req);
  }

  // PUT /owners/:ownerId
  @Put(":ownerId")
  async updateOwner(
    @Param() param: OwnerId,
    @Body() dto: UpdateOwnerRequest
  ): Promise<OwnerResponseWithTokens> {
    return this.ownerService.updateOwner(param.ownerId, dto);
  }

  // DELETE /owners/:ownerId
  @Delete(":ownerId")
  async deleteOwner(
    @Param() param: DeleteOwnerRequest
  ): Promise<DeleteOwnerResponse> {
    return this.ownerService.deleteOwner(param.ownerId);
  }
}
