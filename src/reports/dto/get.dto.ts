import { IsOptional, IsNotEmpty, IsDateString } from 'class-validator';
import {
  Report,
  ReportLayout,
  ReportLayoutType,
} from '../models/reports.models';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
} from '@nestjs/swagger';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';

export class GetReportDto extends GenericResponseDto {
  constructor(report: Report) {
    super();

    this.id = report.id;
    this.reportName = report.reportName;
    this.nameInExport = report.nameInExport;
    this.startDate = report.startDate;
    this.endDate = report.endDate;
    this.reportLayout = report.reportLayout;
  }

  @ApiResponseProperty()
  id: string;

  @ApiProperty({
    example: 'Monthly Report',
    description: 'The name name of the report',
  })
  @IsNotEmpty()
  reportName: string;

  @ApiPropertyOptional({
    example: 'montly_report_Aug_2024',
    description: 'The name to be used when exporting',
  })
  @IsOptional()
  nameInExport?: string;

  @ApiProperty({
    example: '2024-08-01',
    description: 'The start date of the report',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    example: '2024-08-31',
    description: 'The end date of the report',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

  @ApiProperty({
    example: 'PORTRAIT',
    description: 'The layout of the report',
    enum: ReportLayout,
  })
  @IsNotEmpty()
  reportLayout: ReportLayoutType;
}
