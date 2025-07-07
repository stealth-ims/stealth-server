import { PaginationRequestDto } from 'src/core/shared/dto/pagination.dto';
import { CreateSaleDto, CreateSaleResponseDto } from './create.dto';
import {
  ApiPropertyOptional,
  PickType,
  OmitType,
  IntersectionType,
  ApiResponseProperty,
} from '@nestjs/swagger';
import { IsBooleanString, IsEnum, IsOptional } from 'class-validator';
import { PaymentStatus } from '../models/sales.model';
import { GenericResponseDto } from '../../core/shared/dto/base.dto';

export class ItemDto {
  @ApiResponseProperty({ example: 'Some Item' })
  name: string;

  @ApiResponseProperty({ example: 'Some Item Brand' })
  brandName: string;

  @ApiResponseProperty({ example: 85.01 })
  sellingPrice: number;
}

export class BatchResponseDto {
  @ApiResponseProperty({ type: ItemDto })
  item: ItemDto;

  @ApiResponseProperty({ example: 'e0ef0214-d468-49a8-8f6e-45334e2da751b' })
  batchId: string;

  @ApiResponseProperty({ example: 2 })
  quantity: number;

  @ApiResponseProperty({ example: 'BATCH3464e1' })
  batchNumber: string;
}
export class GetSalesDto extends IntersectionType(
  OmitType(CreateSaleDto, [
    'subTotal',
    'saleItems',
    'patientId',
    'patientCardId',
  ]),
  OmitType(GenericResponseDto, ['updatedAt']),
) {
  @ApiResponseProperty({
    example: {
      id: '4f2dd5bb-ae60-41ca-9227-0fb3dacebcbe',
      cardIdentificationNumber: 'gh-56387082875',
      name: 'Paul Billings',
    },
  })
  patient: object;

  @ApiResponseProperty({
    example: {
      item: {
        name: 'Some Item',
        brandName: 'Some Item Brand',
        sellingPrice: 85.01,
      },
      batchId: 'e0ef0214-d468-49a8-8f6e-45334e2da751b',
      batchNumber: 'BATCH3464e1',
    },
  })
  saleItem: BatchResponseDto;

  @ApiResponseProperty({
    example: 0,
  })
  remainderItems: number;

  @ApiResponseProperty({
    example: 2,
  })
  totalQuantity: number;
}

export class GetSaleDto extends OmitType(CreateSaleResponseDto, [
  'patientId',
  'saleItems',
  'deletedAt',
  'deletedBy',
]) {
  @ApiResponseProperty({
    example: {
      id: '4f2dd5bb-ae60-41ca-9227-0fb3dacebcbe',
      cardIdentificationNumber: 'gh-56387082875',
      name: 'Paul Billings',
    },
  })
  patient: object;

  @ApiResponseProperty({
    example: [
      {
        item: {
          name: 'Some Item',
          brandName: 'Some Item Brand',
          sellingPrice: 85.01,
        },
        batchId: 'e0ef0214-d468-49a8-8f6e-45334e2da751b',
        quantity: 2,
        batchNumber: 'BATCH3464e1',
      },
    ],
  })
  saleItems: BatchResponseDto[];
}

export class GetSalesPaginationDto extends PaginationRequestDto {
  @ApiPropertyOptional({
    example: true,
    description: "The filter for viewing only today's sales",
  })
  @IsOptional()
  @IsBooleanString()
  todaySales: string;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    description: 'The various payment statuses',
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}

export class FindItemDto extends PickType(PaginationRequestDto, [
  'search',
  'page',
  'pageSize',
]) {}

export class GetSalesItemsDto {
  @ApiResponseProperty({
    example: 'e0ef0214-d468-49a8-8f6e-453912da751b',
  })
  batchId: string;

  @ApiResponseProperty({
    example: 'BATCH4325',
  })
  batchNumber: string;

  @ApiResponseProperty({
    example: new Date(),
  })
  validity: string;

  @ApiResponseProperty({
    example: 20,
  })
  quantity: number;

  @ApiResponseProperty({
    example: {
      id: 'e7f7424f-04d6-4027-b9af-a25be14c4703',
      name: 'Some Item',
      brandName: 'Some Item brand',
      sellingPrice: 47.01,
    },
  })
  item: object;
}
