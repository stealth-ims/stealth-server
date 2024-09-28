import {
  Body,
  Controller,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create.dto';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import { GetReportSuccessDto } from './dto/get.dto';

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
}
