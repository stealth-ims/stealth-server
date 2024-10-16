import { DepartmentService } from './department/department.service';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Put,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CustomApiResponse } from '../shared/docs/decorators';
import { DepartmentResponse } from './department/dto';
import { PaginationRequestDto } from '../shared/docs/dto/pagination.dto';
import { GetUser, Roles } from '../auth/decorator';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from '../utils/responses/success.response';
import { Department } from './department/models/department.model';
import { throwError } from '../utils/responses/error.response';
import { User } from '../auth/models/user.model';
import { ChangeRoleDto, GetAdminUserDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '../auth/interface/roles.enum';

@ApiTags('Admin')
@Roles(Role.HospitalAdmin)
@Controller('admin')
export class AdminController {
  private readonly logger: Logger;
  constructor(
    private readonly adminService: AdminService,
    private readonly departmentService: DepartmentService,
  ) {
    this.logger = new Logger(AdminController.name);
  }

  @Get('/departments')
  @CustomApiResponse(['paginated', 'authorize'], {
    type: DepartmentResponse,
    message: 'Departments retrieved successfully',
  })
  async getDepartments(
    @Query() query: PaginationRequestDto,
    @GetUser('facility') facilityId: string,
  ) {
    try {
      const { rows, count } = await this.departmentService.findAll(
        query,
        facilityId,
      );
      return new ApiSuccessResponseDto(
        new PaginatedDataResponseDto<Department[]>(
          rows,
          query.page || 1,
          query.pageSize,
          count,
        ),
        HttpStatus.OK,
        'Departments retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @Get('/users/facility')
  @CustomApiResponse(['paginated', 'authorize'], {
    type: GetAdminUserDto,
    message: 'Facility personnel retrieved successfully',
  })
  async getFacilityPersonnel(
    @Query() query: PaginationRequestDto,
    @GetUser('facility') facilityId: string,
  ) {
    const { rows, count } =
      await this.adminService.findFaciltyPersonnel(facilityId);
    return new ApiSuccessResponseDto(
      new PaginatedDataResponseDto<User[]>(
        rows,
        query.page || 1,
        query.pageSize,
        count,
      ),
      HttpStatus.OK,
      'facility personnel retrieved successfully',
    );
  }

  @Get('/users/department')
  @CustomApiResponse(['paginated', 'authorize'], {
    type: GetAdminUserDto,
    message: 'Department personnel retrieved successfully',
  })
  async getDepartmentPersonnel(
    @Query() query: PaginationRequestDto,
    @GetUser('facility') facilityId: string,
  ) {
    const { rows, count } =
      await this.adminService.findDepartmentPersonnel(facilityId);
    return new ApiSuccessResponseDto(
      new PaginatedDataResponseDto<User[]>(
        rows,
        query.page || 1,
        query.pageSize,
        count,
      ),
      HttpStatus.OK,
      'department personnel retrieved successfully',
    );
  }

  @Put('/users/:id/role')
  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    type: GetAdminUserDto,
    message: 'User role updated successfully',
  })
  async changeRole(
    @Param('id') personnelId: string,
    @Body() dto: ChangeRoleDto,
    @GetUser('sub') adminId: string,
  ) {
    await this.adminService.changeUserRole(personnelId, dto, adminId);
    return new ApiSuccessResponseNoData(
      HttpStatus.OK,
      'user role updated successfully',
    );
  }

  @Patch('/users/:id/approve')
  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    type: GetAdminUserDto,
    message: 'User approved successfully',
  })
  async approveUser(
    @Param('id') personnelId: string,
    @GetUser('sub') adminId: string,
  ) {
    await this.adminService.acceptUser(personnelId, adminId);
    return new ApiSuccessResponseNoData(
      HttpStatus.OK,
      'user approved successfully',
    );
  }

  @Patch('/users/:id/reject')
  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    type: GetAdminUserDto,
    message: 'User rejected successfully',
  })
  async declineUser(
    @Param('id') personnelId: string,
    @GetUser('sub') adminId: string,
  ) {
    await this.adminService.rejectUser(personnelId, adminId);
    return new ApiSuccessResponseNoData(
      HttpStatus.OK,
      'user rejected successfully',
    );
  }
}
