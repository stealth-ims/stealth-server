import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';
export class ExportQueryDto {
  @ApiProperty({ example: 'csv', enum: ['csv', 'xlsx'] })
  @IsNotEmpty()
  @IsIn(['csv', 'xlsx'])
  exportType: 'csv' | 'xlsx';
}
