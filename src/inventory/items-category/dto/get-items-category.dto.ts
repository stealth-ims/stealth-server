import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { GenericResponseDto } from 'src/core/shared/docs/dto/base.dto';
import {
  ItemCategory,
  ItemCategoryStatus,
} from '../models/items-category.model';
import { PaginationRequestDto } from '../../../core/shared/docs/dto/pagination.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class ItemCategoryResponse extends IntersectionType(
  ItemCategory,
  GenericResponseDto,
) {}

export class FindItemCategoryDto extends PaginationRequestDto {
  @ApiPropertyOptional({
    enum: ItemCategoryStatus,
  })
  @IsOptional()
  @IsEnum(ItemCategoryStatus)
  status: ItemCategoryStatus;
}
