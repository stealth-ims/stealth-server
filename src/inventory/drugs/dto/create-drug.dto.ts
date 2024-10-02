import {
  IsString,
  IsNumber,
  IsEnum,
  IsUUID,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DosageForm } from '../models/drug.model';

export class CreateDrugDto {
  @ApiProperty({
    example: 'Drug Name',
    description: 'The name of the drug',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Brand Name',
    description: 'The brand name of the drug',
  })
  @IsString()
  brandName: string;

  @ApiProperty({
    example: 10.99,
    description: 'The cost price of the drug',
  })
  @IsNumber()
  costPrice: number;

  @ApiProperty({
    example: 19.99,
    description: 'The selling price of the drug',
  })
  @IsNumber()
  sellingPrice: number;

  @ApiProperty({
    example: 'SOLIDS',
    enum: ['SOLIDS', 'LIQUIDS'],
    description: 'The dosage form of the drug',
  })
  @IsEnum(DosageForm)
  dosageForm: DosageForm;

  @ApiProperty({
    example: 'ABC-DGU-123',
    description: 'The code of the drug',
  })
  @IsString()
  code: string;

  @ApiProperty({
    example: '2022-12-31',
    description: 'The validity of the drug',
  })
  @Matches(/\d{4}-\d{2}-\d{2}/, { message: 'Invalid date format: YYYY-MM-DD' })
  validity: Date;

  @ApiProperty({
    example: 'FDA123',
    description: 'The FDA approval of the drug',
  })
  @IsString()
  fdaApproval: string;

  @ApiProperty({
    example: 'ISO123',
    description: 'The ISO certification of the drug',
  })
  @IsString()
  ISO: string;

  @ApiProperty({
    example: 'BATCH123',
    description: 'The batch number of the drug',
  })
  @IsString()
  batch: string;

  @ApiProperty({
    example: 100,
    description: 'The stock quantity of the drug',
  })
  @IsNumber()
  stock: number;

  @ApiProperty({
    example: 10,
    description: 'The reorder point of the drug',
  })
  @IsNumber()
  reorderPoint: number;

  @ApiProperty({
    example: 'strength',
    description: 'The strength of the drug',
  })
  @IsString()
  strength: string;

  @ApiProperty({
    example: 'gramms',
    description: 'The unit of measurement of the drug',
  })
  @IsString()
  unitOfMeasurement: string;

  @ApiProperty({
    example: 'Manufacturer Name',
    description: 'The manufacturer of the drug',
  })
  @IsString()
  manufacturer: string;

  @ApiProperty({
    example: 'Store in a cool, dry place',
    description: 'The storage requirements of the drug',
  })
  @IsString()
  storageReq: string;

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'The category ID of the drug',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'The supplier ID of the drug',
  })
  @IsUUID()
  supplierId: string;

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: "Add facility ID if it's a facility drug",
  })
  @IsUUID()
  facilityId: string;

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'Add department ID if it is a department drug',
  })
  @IsUUID()
  @IsOptional()
  departmentId: string;
}
