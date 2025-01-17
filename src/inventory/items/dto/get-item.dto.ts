import {
  IntersectionType,
  ApiPropertyOptional,
  ApiProperty,
  ApiResponseProperty,
} from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { Item } from '../models';
import { ItemStatus } from './create-item.dto';

export class ItemPaginationDto extends IntersectionType(PaginationRequestDto) {
  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional()
  supplierId: string;

  @ApiPropertyOptional()
  @IsString({ each: true })
  @IsOptional()
  categories: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  facilityId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  departmentId: string;
}

class AnalyticsData {
  @ApiProperty({
    description: 'The data representing the labels',
  })
  data: number[];

  @ApiProperty({
    description: 'The labels describing the individual data',
  })
  labels: string[];
}

export class ItemAnalytics {
  @ApiProperty({
    example: {
      data: [10, 15, 8, 12, 14, 18, 20],
      labels: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
    },
    description:
      'The total consumption of the item in the system over the past week.',
  })
  oneWeek: AnalyticsData;

  @ApiProperty({
    example: {
      data: [50, 60, 55, 70],
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    },
    description:
      'The total consumption of the item in the system over the past month.',
  })
  oneMonth: AnalyticsData;

  @ApiProperty({
    example: {
      data: [40, 35, 50, 60, 45, 55, 70, 65, 75, 80, 90, 85],
      labels: [
        'Week 1',
        'Week 2',
        'Week 3',
        'Week 4',
        'Week 5',
        'Week 6',
        'Week 7',
        'Week 8',
        'Week 9',
        'Week 10',
        'Week 11',
        'Week 12',
      ],
    },
    description:
      'The total consumption of the item in the system over the past three months.',
  })
  threeMonths: AnalyticsData;

  @ApiProperty({
    example: {
      data: [500, 450, 480, 470, 520, 530, 510, 490, 500, 480, 470, 460],
      labels: [
        'Month 1',
        'Month 2',
        'Month 3',
        'Month 4',
        'Month 5',
        'Month 6',
        'Month 7',
        'Month 8',
        'Month 9',
        'Month 10',
        'Month 11',
        'Month 12',
      ],
    },
    description:
      'The total consumption of the item in the system over the past year.',
  })
  oneYear: AnalyticsData;
}

export class ItemCounts {
  @ApiProperty({
    example: 4500,
    description: 'The total number of items in the system',
  })
  totalItems: number;

  @ApiProperty({
    example: 1200,
    description: 'The total items in stock in the system',
  })
  totalInStock: number;

  @ApiProperty({
    example: 20,
    description: 'The number of items that are out of stock',
  })
  outOfStock: number;

  @ApiProperty({
    example: 50,
    description: 'The number of items that are high in stock',
  })
  highStocked: number;

  @ApiProperty({
    example: 80,
    description: 'The number of items that are low in stock',
  })
  lowStocked: number;
}

export class OneItem extends IntersectionType(Item, GenericResponseDto) {
  @ApiResponseProperty({
    example: 'John Doe,58dceb42-02bb-465f-bd5d-4b52ef181a18',
  })
  createdBy: string;

  @ApiResponseProperty({
    example: 120,
  })
  totalStock: number;
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
class CategoryDto {
  @ApiResponseProperty({
    example: '52159509-1aee-4d47-8475-47906250423a',
  })
  id: string;

  @ApiResponseProperty({
    example: 'Analgesics',
  })
  name: string;
}

class SupplierDto {
  @ApiResponseProperty({
    example: '6bc6b563-b136-4e5e-ad7c-3624e0bb3986',
  })
  id: string;

  @ApiResponseProperty({
    example: 'Supplier B',
  })
  name: string;
}

export class GetItemsResponseDto extends GenericResponseDto {
  @ApiResponseProperty({
    example: 'Analgesics Item 2',
  })
  name: string;

  @ApiResponseProperty({
    example: 'STOCKED',
  })
  status: string;

  @ApiResponseProperty({
    example: 87,
  })
  reorderPoint: number;

  @ApiResponseProperty({
    type: CategoryDto,
  })
  category: CategoryDto;

  @ApiResponseProperty({
    type: SupplierDto,
  })
  supplier: SupplierDto;

  @ApiResponseProperty({
    example: 2,
  })
  supplierRemainder: number;

  @ApiResponseProperty({
    example: 1497,
  })
  totalStock: number;
}
