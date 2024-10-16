import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class PaginationRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  page: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  pageSize: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderDirection: string = 'DESC';
}
