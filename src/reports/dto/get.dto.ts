import {
  IsOptional,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsString,
} from 'class-validator';
import { ReportLayout, ReportLayoutType } from '../models/reports.models';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
  OmitType,
} from '@nestjs/swagger';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';

type ReportCategory = {
  id: string;
  label: string;
};

export class GetReportCategoriesDto {
  @ApiResponseProperty()
  inventoryReports: ReportCategory[];

  @ApiResponseProperty()
  salesReports: ReportCategory[];
}

export class GetReportDto extends GenericResponseDto {
  @ApiResponseProperty()
  id: string;

  @ApiProperty({
    example: 'Monthly Report',
    description: 'The name of the report',
  })
  @IsNotEmpty()
  reportName: string;

  @ApiPropertyOptional({
    example: 'montly_report_Aug_2024',
    description: 'The name to be used when exporting',
  })
  @IsOptional()
  @IsString()
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
  @IsEnum(ReportLayout)
  reportLayout: ReportLayoutType;
}

export class GetReportPaginationDto extends OmitType(PaginationRequestDto, [
  'search',
]) {
  @ApiPropertyOptional({
    description: 'The name of the report',
    example: 'Monthly Report',
  })
  @IsOptional()
  reportName: string;

  @ApiPropertyOptional({
    description: 'The name to be used when exporting',
    example: 'montly_report_Aug_2024',
  })
  @IsOptional()
  nameInExport: string;

  @ApiPropertyOptional({
    description: 'The start date of the report',
    example: '2024-08-01',
  })
  @IsOptional()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({
    description: 'The end date of the report',
    example: '2024-08-31',
  })
  @IsOptional()
  @IsDateString()
  endDate: string;
}
