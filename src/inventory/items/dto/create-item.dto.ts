import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { ItemCategoryExists } from '../../../shared/validators/item-category-exists.validator';

export enum DosageForm {
  SOLIDS = 'SOLIDS',
  LIQUIDS = 'LIQUIDS',
}

export enum ItemStatus {
  LOW = 'LOW',
  STOCKED = 'STOCKED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}
export class CreateItemDto {
  @ApiProperty({
    example: 'Item Name',
    description: 'The name of the item',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Brand Name',
    description: 'The brand name of the item',
  })
  @IsString()
  brandName: string;

  @ApiProperty({
    example: 10.99,
    description: 'The cost price of the item',
  })
  @IsNumber()
  costPrice: number;

  @ApiProperty({
    example: 19.99,
    description: 'The selling price of the item',
  })
  @IsNumber()
  sellingPrice: number;

  @ApiProperty({
    example: DosageForm.LIQUIDS,
    enum: DosageForm,
    description: 'The dosage form of the item',
  })
  @IsNotEmpty()
  @IsEnum(DosageForm)
  dosageForm: DosageForm;

  @ApiProperty({
    example: 'ABC-DGU-123',
    description: 'The code of the item',
  })
  @IsString()
  code: string;

  @ApiProperty({
    example: 'FDA123',
    description: 'The FDA approval of the item',
  })
  @IsString()
  fdaApproval: string;

  @ApiProperty({
    example: 'ISO123',
    description: 'The ISO certification of the item',
  })
  @IsString()
  ISO: string;

  @ApiProperty({
    example: 10,
    description: 'The reorder point of the item',
  })
  @IsNumber()
  reorderPoint: number;

  @ApiProperty({
    example: 'strength',
    description: 'The strength of the item',
  })
  @IsString()
  strength: string;

  @ApiProperty({
    example: 'gramms',
    description: 'The unit of measurement of the item',
  })
  @IsString()
  unitOfMeasurement: string;

  @ApiProperty({
    example: 'Manufacturer Name',
    description: 'The manufacturer of the item',
  })
  @IsString()
  manufacturer: string;

  @ApiProperty({
    example: 'Store in a cool, dry place',
    description: 'The storage requirements of the item',
  })
  @IsString()
  storageReq: string;

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'The category ID of the item',
  })
  @IsUUID()
  @ItemCategoryExists()
  categoryId: string;

  @ApiResponseProperty({
    example: 'Kratos',
  })
  createdBy: string;

  @ApiResponseProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
  })
  createdById: string;

  @ApiResponseProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
  })
  facilityId: string;

  @ApiResponseProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
  })
  departmentId: string;

  @ApiResponseProperty({
    example: ItemStatus.OUT_OF_STOCK,
    enum: ItemStatus,
  })
  status: ItemStatus;
}
