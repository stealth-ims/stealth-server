import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create.dto';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import { ApiSuccessResponseDto } from 'src/utils/responses/success.response';
import { Report } from './models/reports.models';
import { GetReportDto } from './dto/get.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @CustomApiResponse(['created', 'forbidden', 'unauthorized'], {
    type: GetReportDto,
    message: 'Report created successfully',
  })
  @Post()
  async postReport(@Body() dto: CreateReportDto) {
    const response = await this.reportsService.createReport(dto);

    return new ApiSuccessResponseDto<Report>(
      response,
      HttpStatus.OK,
      'Report created successfully',
    );
  }
}
