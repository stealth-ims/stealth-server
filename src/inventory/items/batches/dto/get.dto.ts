import { CreateBatchDto } from './create.dto';
import {
  ApiPropertyOptional,
  ApiResponseProperty,
  IntersectionType,
  PickType,
} from '@nestjs/swagger';
import { GenericResponseDto } from '../../../../core/shared/dto/base.dto';
import { GetNoPaginateDto } from '../../../../core/shared/dto/get-no_paginate.dto';
import { PaginationRequestDto } from '../../../../core/shared/dto/pagination.dto';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { addDays } from 'date-fns';
import { GetMarkupDto } from '../../markup/dto';

export class OneBatch extends IntersectionType(
  CreateBatchDto,
  GenericResponseDto,
) {}

export class BatchResponseDto extends IntersectionType(
  PickType(OneBatch, [
    'id',
    'createdAt',
    'validity',
    'batchNumber',
    'quantity',
  ]),
) {
  @ApiResponseProperty({
    type: GetNoPaginateDto,
  })
  supplier: GetNoPaginateDto;

  @ApiResponseProperty({
    type: GetNoPaginateDto,
  })
  item: GetNoPaginateDto;

  @ApiResponseProperty({
    type: GetMarkupDto,
  })
  markup: GetMarkupDto;
}

export class BatchesNoPaginate extends IntersectionType(
  PickType(CreateBatchDto, ['batchNumber', 'quantity', 'validity']),
  PickType(GenericResponseDto, ['id']),
) {}

export class FetchBatchesQueryDto extends PaginationRequestDto {
  @ApiPropertyOptional({
    example: new Date(),
  })
  @IsOptional()
  @Type(() => Date)
  validityStartDate: Date;

  @ApiPropertyOptional({ example: addDays(new Date(), 1) })
  @IsOptional()
  @Type(() => Date)
  validityEndDate: Date;
}

export class ExpiredAlert {
  facilityId: string;
  departmentId?: string;
  @Type(() => Number)
  nearExpiry: number;
  @Type(() => Number)
  expired: number;
}
