import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import {
  Report,
  ReportLayout,
  ReportLayoutType,
} from '../models/reports.models';
import { ApiResponseProperty, IntersectionType } from '@nestjs/swagger';

export class GetReportDto extends IntersectionType(Report, GenericResponseDto) {
  @ApiResponseProperty({
    example: 'Monthly Report',
    type: String,
  })
  reportName: string;

  @ApiResponseProperty({
    example: 'montly_report_Aug_2024',
    type: String,
  })
  nameInExport: string;

  @ApiResponseProperty({
    example: '2024-08-01',
    type: Date,
  })
  startDate: Date;

  @ApiResponseProperty({
    example: '2024-08-31',
    type: Date,
  })
  endDate: Date;

  @ApiResponseProperty({
    example: '2024-08-31',
    type: Date,
  })
  deletedAt: Date;

  @ApiResponseProperty({
    example: 'you',
    type: String,
  })
  deletedBy: string;

  @ApiResponseProperty({
    example: 'PORTRAIT',
    enum: ReportLayout,
  })
  reportLayout: ReportLayoutType;
}
