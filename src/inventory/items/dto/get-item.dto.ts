import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  OmitType,
} from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import { Batch, Item } from '../models';

export class ItemPaginationDto extends IntersectionType(PaginationRequestDto) {
  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional()
  supplierId: string;

  @ApiPropertyOptional()
  @IsString({ each: true })
  @IsOptional()
  categories: string[];

  @IsUUID()
  @ApiPropertyOptional()
  facilityId: string;

  @IsUUID()
  @ApiPropertyOptional()
  @IsOptional()
  departmentId: string;
}

export class ItemAnalytics {
  @ApiProperty({
    example: 100,
    description: 'The total number of drugs in the system',
  })
  totalDrugs: number;

  @ApiProperty({ example: 10, description: 'The number of drug requests' })
  drugRequests: number;

  @ApiProperty({
    example: 5,
    description: 'The percentage increment of drug requests',
  })
  drugIncrement: number;

  @ApiProperty({
    example: 10,
    description: 'The number of drug request increments',
  })
  requestIncrement: number;

  @ApiProperty({
    example: 20,
    description: 'The number of drugs that are out of stock',
  })
  outOfStock: number;

  @ApiProperty({
    example: 50,
    description: 'The number of drugs that are in stock',
  })
  stocked: number;

  @ApiProperty({
    example: 80,
    description: 'The number of drugs that are low in stock',
  })
  lowStocked: number;
}

export class OneItem extends IntersectionType(Item, GenericResponseDto) {
  @ApiProperty({ description: 'The batches of the drug', type: () => Batch })
  batches: Batch[];
}

export class ManyItem extends IntersectionType(
  OmitType(Item, ['batches']),
  GenericResponseDto,
) {
  @ApiProperty({ description: 'The batch of the drug', type: () => Batch })
  batch: Batch;
}
