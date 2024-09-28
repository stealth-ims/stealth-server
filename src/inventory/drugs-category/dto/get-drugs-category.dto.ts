import { IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import { DrugsCategory } from '../models/drugs-category.model';

export class GetDrugsCategoryDto {
  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  @Matches(/(\w=\d)*/)
  order?: string;

  @IsOptional()
  search?: string;
}

export class DrugsCategoryResponse extends IntersectionType(
  DrugsCategory,
  GenericResponseDto,
) {}
