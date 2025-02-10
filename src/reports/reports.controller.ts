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
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from 'src/utils/responses/success.response';
import { throwError } from 'src/utils/responses/error.response';
import { GetUser, Permission } from '../auth/decorator';
import { Features, PermissionLevel } from '../shared/enums/permissions.enum';
import {
  CreateReportDto,
  FindReportDataDto,
  GetReportDataDto,
  GetReportDto,
  GetReportPaginationDto,
  ReportCategories,
  UpdateReportDto,
} from './dto';
import { IUserPayload } from '../auth/interface/payload.interface';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  private logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @CustomApiResponse(['success', 'authorize'], {
    type: GetReportDto,
    message: 'Report created successfully',
  })
  @Permission(Features.REPORTS, PermissionLevel.READ_WRITE)
  @Post()
  async postReport(
    @Body() dto: CreateReportDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const response = await this.reportsService.create(dto, user);

      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Report created successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['paginated', 'authorize'], {
    type: GetReportDto,
    message: 'Reports fetched successfully',
  })
  @Permission(Features.REPORTS, PermissionLevel.READ)
  @Get()
  async getReports(
    @Query() query: GetReportPaginationDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const response = await this.reportsService.fetchAll(query, user);
      const paginated = new PaginatedDataResponseDto(
        response.rows,
        query.page || 1,
        query.pageSize,
        response.count,
      );
      return new ApiSuccessResponseDto(
        paginated,
        HttpStatus.OK,
        'Reports fetched successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: GetReportDataDto,
    isArray: true,
    message: 'Report data fetched successfully',
  })
  @Permission(Features.REPORTS, PermissionLevel.READ)
  @ApiParam({
    name: 'type',
    description: 'Experiment with periodic_sales_report',
    enum: ReportCategories,
  })
  @Get(':type/data')
  async getReportData(
    @Param('type') type: ReportCategories,
    @Query() query: FindReportDataDto,
  ) {
    try {
      const response = await this.reportsService.fetchData(type, query);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Report data successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize', 'notfound'], {
    type: GetReportDto,
    message: 'Report fetched successfully',
  })
  @Permission(Features.REPORTS, PermissionLevel.READ)
  @Get(':id')
  async getReport(@Param('id') id: string) {
    try {
      const response = await this.reportsService.fetchOne(id);

      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Report fetched successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    message: 'Report updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Permission(Features.REPORTS, PermissionLevel.READ_WRITE)
  @Patch(':id')
  async editReport(@Body() dto: UpdateReportDto, @Param('id') id: string) {
    try {
      await this.reportsService.update(id, dto);

      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Report updated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    type: String,
    message: 'Report deleted successfully',
  })
  @Permission(Features.REPORTS, PermissionLevel.READ_WRITE_DELETE)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.reportsService.removeOne(id);

      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Report deleted successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
