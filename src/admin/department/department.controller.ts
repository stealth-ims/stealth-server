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
import { Authorize, GetUser, Roles } from '../../auth/decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../../auth/interface/roles.enum';
import { CustomApiResponse } from '../../shared/docs/decorators';
import { PaginationRequestDto } from '../../shared/docs/dto/pagination.dto';
import { Department } from './models/department.model';
import { throwError } from '../../utils/responses/error.response';

@ApiTags('Department')
@ApiBearerAuth('access-token')
@Authorize()
@Roles(Role.HospitalAdmin)
@Controller('departments')
export class DepartmentController {
  private readonly logger;
  constructor(private readonly departmentService: DepartmentService) {
    this.logger = new Logger(DepartmentController.name);
  }

  @Post()
  @CustomApiResponse(['created', 'unauthorized', 'forbidden'], {
    type: DepartmentResponse,
    message: 'Department created successfully',
  })
  async addDepartment(
    @Body() dto: CreateDepartmentDto,
    @GetUser('sub') adminId: string,
  ) {
    try {
      const response = await this.departmentService.create(dto, adminId);
      return new ApiSuccessResponseDto<Department>(
        response,
        HttpStatus.CREATED,
        'Department created successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @Get()
  @CustomApiResponse(['paginated', 'unauthorized', 'forbidden'], {
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

  @Get(':id')
  @CustomApiResponse(['accepted', 'unauthorized', 'forbidden', 'notfound'], {
    type: DepartmentResponse,
    message: 'Department retrieved successfully',
  })
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

  @Patch(':id')
  @CustomApiResponse(['patch', 'unauthorized', 'forbidden', 'notfound'], {
    type: null,
    message: 'Department updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  async editDepartment(
    @Body() dto: UpdateDepartmentDto,
    @Param('id') id: string,
    @GetUser('sub') adminId: string,
  ) {
    try {
      const _response = await this.departmentService.update(id, dto, adminId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Department updated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @Delete(':id')
  @CustomApiResponse(['patch', 'unauthorized', 'forbidden'], {
    type: null,
    message: 'Department deleted successfully',
  })
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
