import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryOptionsDto<T> {
  @ApiPropertyOptional({
    type: [String],
    description: 'Populate related resources',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  populate?: (keyof T)[];

  @ApiPropertyOptional({ type: [String], description: 'Fields to return' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: (keyof T)[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Fields to exclude from result',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludeFields?: string[];

  @ApiPropertyOptional({
    type: Number,
    minimum: 0,
    description: 'Pagination limit',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  pageSize?: number;

  @ApiPropertyOptional({
    type: Number,
    minimum: 0,
    description: 'Pagination offset',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ type: String, description: 'Sort by field' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ type: String, description: 'Text to search' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ type: String, description: 'Insensitive search text' })
  @IsOptional()
  @IsString()
  iSearch?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Fields to search within',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  searchFields?: string[];

  @ApiPropertyOptional({
    type: Object,
    description: 'Filter query as object or JSON string',
  })
  @IsOptional()
  query?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter query as JSON string',
  })
  @IsOptional()
  @ValidateIf((o) => typeof o.query === 'string')
  @IsString()
  queryString?: string;
}
