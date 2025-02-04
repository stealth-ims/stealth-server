import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CustomApiResponse } from '../shared/docs/decorators';
import { PaginationRequestDto } from '../shared/docs/dto/pagination.dto';
import { GetUser, Permission } from '../auth/decorator';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from '../utils/responses/success.response';
import { throwError } from '../utils/responses/error.response';
import { User } from '../auth/models/user.model';
import { ChangeRoleDto, GetAdminUserDto } from './dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Features, PermissionLevel } from '../shared/enums/permissions.enum';
import { CreateUserDto, GetUserDto } from '../user/dto';
import { IUserPayload } from '../auth/interface/payload.interface';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  private readonly logger: Logger;
  constructor(private readonly adminService: AdminService) {
    this.logger = new Logger(AdminController.name);
  }

  @ApiOperation({ summary: 'For creating a new user. Done by admin' })
  @CustomApiResponse(['created', 'authorize'], {
    type: GetUserDto,
    message: 'User created successfully',
  })
  @Permission(Features.USERS, PermissionLevel.READ_WRITE)
  @Post('/user')
  async createUser(
    @Body() dto: CreateUserDto,
    @GetUser('facility', ParseUUIDPipe) facilityId: string,
  ) {
    try {
      const response = await this.adminService.createPersonnel(dto, facilityId);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.CREATED,
        'User created successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['paginated', 'authorize'], {
    type: GetAdminUserDto,
    message: 'Personnels retrieved successfully',
  })
  @Permission(Features.USERS, PermissionLevel.READ)
  @Get('/users')
  async getFacilityPersonnel(
    @Query() query: PaginationRequestDto,
    @GetUser() user: IUserPayload,
  ) {
    const { sub, facility, department } = user;
    const { rows, count } = await this.adminService.findFaciltyPersonnel(
      facility,
      department,
      sub,
    );
    return new ApiSuccessResponseDto(
      new PaginatedDataResponseDto<User[]>(
        rows,
        query.page || 1,
        query.pageSize,
        count,
      ),
      HttpStatus.OK,
      'personnels retrieved successfully',
    );
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: GetUserDto,
    message: 'Personnel retrieved successfully',
  })
  @Permission(Features.USERS, PermissionLevel.READ)
  @Get('users/:id')
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    const response = await this.adminService.retrieveUser(id);
    return new ApiSuccessResponseDto(
      response,
      HttpStatus.OK,
      'Personnel retrieved successfully',
    );
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    type: GetAdminUserDto,
    message: 'User role updated successfully',
  })
  @Permission(Features.USERS, PermissionLevel.READ_WRITE)
  @Patch('/users/:id/role')
  async changeRole(
    @Param('id', ParseUUIDPipe) personnelId: string,
    @Body() dto: ChangeRoleDto,
    @GetUser('sub', ParseUUIDPipe) adminId: string,
  ) {
    await this.adminService.changeUserRole(personnelId, dto, adminId);
    return new ApiSuccessResponseNoData(
      HttpStatus.OK,
      'user role updated successfully',
    );
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    type: GetAdminUserDto,
    message: 'User deactivated successfully',
  })
  @Permission(Features.USERS, PermissionLevel.READ_WRITE)
  @Patch('/users/:id/deactivate')
  async deactivateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @GetUser('sub', ParseUUIDPipe) adminId: string,
  ) {
    await this.adminService.deactivateUser(userId, adminId);
    return new ApiSuccessResponseNoData(
      HttpStatus.OK,
      'user deactivated successfully',
    );
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    type: GetAdminUserDto,
    message: 'User re-activated successfully',
  })
  @Permission(Features.USERS, PermissionLevel.READ_WRITE)
  @Patch('/users/:id/activate')
  async activateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @GetUser('sub', ParseUUIDPipe) adminId: string,
  ) {
    await this.adminService.activateUser(userId, adminId);
    return new ApiSuccessResponseNoData(
      HttpStatus.OK,
      'user re-activated successfully',
    );
  }

  @CustomApiResponse(['success', 'authorize', 'notfound'], {
    type: ChangeRoleDto,
    isArray: true,
    message: 'Starter roles retrieved successfully',
  })
  @Permission(Features.USERS, PermissionLevel.READ_WRITE)
  @Get('/roles')
  getStarterRoles() {
    const response = this.adminService.retrieveStarterRoles();
    return new ApiSuccessResponseDto(
      response,
      HttpStatus.OK,
      'starter roles retrieved successfully',
    );
  }
}
