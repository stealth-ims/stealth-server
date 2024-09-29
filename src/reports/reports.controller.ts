import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create.dto';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import {
  GetAllReportsSuccessDto,
  GetReportDto,
  GetReportSuccessDto,
} from './dto/get.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @CustomApiResponse(['created', 'forbidden', 'unauthorized'], {
    type: GetReportSuccessDto,
    message: 'Report created successfully',
  })
  @Post()
  @UsePipes(new ValidationPipe())
  async postReport(@Body() dto: CreateReportDto) {
    const response = await this.reportsService.createReport(dto);

    return new GetReportSuccessDto(
      response,
      HttpStatus.OK,
      'Report created successfully',
    );
  }

  @CustomApiResponse(['accepted'], {
    type: GetAllReportsSuccessDto,
    message: 'Report created successfully',
  })
  @Get()
  async getReports() {
    const response = await this.reportsService.fetchAll();

    return new GetAllReportsSuccessDto(
      response,
      HttpStatus.OK,
      'Reports retrieved successfully',
    );
  }

  @CustomApiResponse(['accepted'], {
    type: GetAllReportsSuccessDto,
    message: 'Report fetched successfully',
  })
  @Get('/:id')
  async getReport(@Param('id') id: string) {
    const response = await this.reportsService.fetchOne(id);

    return new GetReportSuccessDto(
      response,
      HttpStatus.OK,
      'Report fetched successfully',
    );
  }

  @CustomApiResponse(['accepted'], {
    type: GetReportDto,
    message: 'Report deleted successfully',
  })
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    const response = await this.reportsService.removeOne(id);

    return new GetReportDto(
      response,
      HttpStatus.OK,
      'Report deleted successfully',
    );
  }
}
