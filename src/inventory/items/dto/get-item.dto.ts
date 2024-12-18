import {
  IntersectionType,
  ApiPropertyOptional,
  ApiProperty,
} from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { Item, Batch, ItemStatus } from '../models';

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
  @IsOptional()
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
    description: 'The total number of items in the system',
  })
  totalItems: number;

  @ApiProperty({ example: 10, description: 'The number of item requests' })
  itemRequests: number;

  @ApiProperty({
    example: 5,
    description: 'The percentage increment of item requests',
  })
  itemIncrement: number;

  @ApiProperty({
    example: 10,
    description: 'The number of item request increments',
  })
  requestIncrement: number;

  @ApiProperty({
    example: 20,
    description: 'The number of items that are out of stock',
  })
  outOfStock: number;

  @ApiProperty({
    example: 50,
    description: 'The number of items that are in stock',
  })
  stocked: number;

  @ApiProperty({
    example: 80,
    description: 'The number of items that are low in stock',
  })
  lowStocked: number;
}

export class OneItem extends IntersectionType(Item, GenericResponseDto) {
  @ApiProperty({ description: 'The batches of the item', type: () => Batch })
  batches: Batch[];
}

export class ManyItem {
  @ApiProperty()
  itemId: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  brandName: string;
  @ApiProperty({ description: 'Expiry date' })
  validity: Date;
  @ApiProperty()
  batchNumber: string;
  @ApiProperty({ description: 'The quantity of the item in the batch' })
  quantity: number;
  @ApiProperty()
  supplierName: string;
  @ApiProperty()
  supplierId: string;
  @ApiProperty()
  status: ItemStatus;
  @ApiProperty()
  reorderPoint: number;
  @ApiProperty()
  category: string;
  @ApiProperty()
  categoryId: string;
  @ApiProperty()
  createdAt: Date;
}
