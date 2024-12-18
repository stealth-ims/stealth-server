import { ApiProperty, ApiResponseProperty, PickType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { DosageForm } from '../models/item.model';

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

  @ApiResponseProperty({
    example: 'Kratos',
  })
  createdBy: string;

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'The category ID of the item',
  })
  @IsUUID()
  categoryId: string;
  @ApiResponseProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
  })
  @IsUUID()
  @IsOptional()
  facilityId: string;

  @ApiResponseProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
  })
  departmentId: string;
}

export class CreateBatchDto extends PickType(CreateItemDto, ['createdBy']) {
  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'The supplier ID of the item',
  })
  @IsUUID()
  supplierId: string;

  @ApiProperty({
    example: 'BATCH123',
    description: 'The batch number of the item',
  })
  @IsString()
  batchNumber: string;

  @ApiProperty({
    example: 100,
    description: 'The stock quantity of the item',
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    example: '2022-12-31',
    description: 'The validity of the item',
  })
  @Matches(/\d{4}-\d{2}-\d{2}/, { message: 'Invalid date format: YYYY-MM-DD' })
  validity: Date;

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'The item ID',
  })
  @IsUUID()
  itemId: string;
}
