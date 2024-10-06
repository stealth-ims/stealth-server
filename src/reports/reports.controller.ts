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
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create.dto';
import {
  CustomApiResponse,
  CustomResponses,
} from 'src/shared/docs/decorators/default.response.decorators';
import { GetReportDto, GetReportPaginationDto } from './dto/get.dto';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from 'src/utils/responses/success.response';
import { Response } from 'express';
import { UpdateReportDto } from './dto/edit.dto';
import { throwError } from 'src/utils/responses/error.response';
const generalResponses: CustomResponses[] = ['success', 'authorize'];

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  private logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @CustomApiResponse([...generalResponses], {
    type: GetReportDto,
    message: 'Report created successfully',
  })
  @Post()
  async postReport(@Body() dto: CreateReportDto) {
    try {
      const response = await this.reportsService.create(dto);

      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Report created successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['authorize', 'paginated'], {
    type: GetReportDto,
    message: 'Report fetched successfully',
    isArray: true,
  })
  @Get()
  async getReports(@Query() query: GetReportPaginationDto) {
    try {
      const { rows, count } = await this.reportsService.fetchAll(query);

      return new PaginatedDataResponseDto<GetReportDto[]>(
        rows,
        query.page || 1,
        query.pageSize,
        count,
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @Get('/export')
  @CustomApiResponse([...generalResponses], {
    type: null,
    message: 'Report exported successfully',
  })
  @HttpCode(HttpStatus.OK)
  async exportReports(
    @Query() query: GetReportPaginationDto,
    @Res() res: Response,
  ) {
    try {
      const csv = await this.reportsService.export(query);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=report-${Date.now()}.csv`,
      );
      res.send(csv);

      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Report exported successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse([...generalResponses, 'notfound'], {
    type: GetReportDto,
    message: 'Report fetched successfully',
  })
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

  @CustomApiResponse([...generalResponses, 'notfound'], {
    type: String,
    message: 'Report deleted successfully',
  })
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

  @Patch(':id')
  @CustomApiResponse([...generalResponses, 'notfound'], {
    type: null,
    message: 'Report updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  async editDepartment(@Body() dto: UpdateReportDto, @Param('id') id: string) {
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
}
