import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import {
  CreateDepartmentDto,
  DepartmentResponse,
  UpdateDepartmentDto,
} from './dto';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from '../../utils/responses/success.response';
import { GetUser, Permission } from '../../auth/decorator';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from '../../shared/docs/decorators';
import { Department } from './models/department.model';
import { throwError } from '../../utils/responses/error.response';
import { PaginationRequestDto } from '../../shared/docs/dto/pagination.dto';
import { Features, PermissionLevel } from '../../shared/enums/permissions.enum';

@ApiTags('Department')
@Controller('departments')
export class DepartmentController {
  private readonly logger;
  constructor(private readonly departmentService: DepartmentService) {
    this.logger = new Logger(DepartmentController.name);
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: DepartmentResponse,
    message: 'Department created successfully',
  })
  @Permission(Features.DEPARTMENTS, PermissionLevel.READ_WRITE)
  @Post()
  async addDepartment(
    @Body() dto: CreateDepartmentDto,
    @GetUser('facility') facilityId: string,
    @GetUser('sub') adminId: string,
  ) {
    try {
      const response = await this.departmentService.create(
        dto,
        facilityId,
        adminId,
      );
      return new ApiSuccessResponseDto<Department>(
        response,
        HttpStatus.CREATED,
        'Department created successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['paginated', 'authorize'], {
    type: DepartmentResponse,
    message: 'Departments retrieved successfully',
  })
  @Permission(Features.DEPARTMENTS, PermissionLevel.READ)
  @Get()
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

  @CustomApiResponse(['success', 'notfound', 'authorize'], {
    type: DepartmentResponse,
    message: 'Department retrieved successfully',
  })
  @Permission(Features.DEPARTMENTS, PermissionLevel.READ)
  @Get(':id')
  async getDepartment(@Param('id') id: string) {
    try {
      const response = await this.departmentService.findOne(id);
      return new ApiSuccessResponseDto<Department>(
        response,
        HttpStatus.OK,
        'Department retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    message: 'Department updated successfully',
  })
  @Permission(Features.DEPARTMENTS, PermissionLevel.READ_WRITE)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async editDepartment(
    @Body() dto: UpdateDepartmentDto,
    @Param('id') id: string,
    @GetUser('sub') adminId: string,
  ) {
    try {
      await this.departmentService.update(id, dto, adminId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Department updated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    message: 'Department deleted successfully',
  })
  @Permission(Features.DEPARTMENTS, PermissionLevel.READ_WRITE_DELETE)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteDepartment(@Param('id') id: string) {
    try {
      const _response = await this.departmentService.remove(id);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Department updated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
