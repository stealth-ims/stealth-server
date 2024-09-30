import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create.dto';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import { GetReportDto } from './dto/get.dto';
import {
  ApiSuccessResponseDto,
  PaginatedDataResponseDto,
} from 'src/utils/responses/success.response';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @CustomApiResponse(['created', 'forbidden', 'unauthorized'], {
    type: CreateReportDto,
    message: 'Report created successfully',
  })
  @Post()
  async postReport(@Body() dto: CreateReportDto) {
    const response = await this.reportsService.create(dto);

    return new ApiSuccessResponseDto(
      response,
      HttpStatus.OK,
      'Report created successfully',
    );
  }

  @CustomApiResponse(['paginated', 'forbidden', 'unauthorized'], {
    type: GetReportDto,
    message: 'Report created successfully',
    isArray: true,
  })
  @Get()
  async getReports() {
    const response = await this.reportsService.fetchAll();

    return new PaginatedDataResponseDto<GetReportDto[]>(
      response,
      1,
      10,
      response.length,
    );
  }

  @CustomApiResponse(['accepted', 'forbidden', 'unauthorized'], {
    type: GetReportDto,
    message: 'Report fetched successfully',
  })
  @Get('/:id')
  async getReport(@Param('id') id: string) {
    const response = await this.reportsService.fetchOne(id);

    return new ApiSuccessResponseDto(
      response,
      HttpStatus.OK,
      'Report fetched successfully',
    );
  }

  @CustomApiResponse(['accepted', 'forbidden', 'unauthorized'], {
    type: GetReportDto,
    message: 'Report deleted successfully',
  })
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    const response = await this.reportsService.removeOne(id);

    return new ApiSuccessResponseDto(
      response,
      HttpStatus.OK,
      'Report deleted successfully',
    );
  }
}
