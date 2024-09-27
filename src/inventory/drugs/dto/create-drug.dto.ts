import { IsString, IsNumber, IsEnum, IsDate } from 'class-validator';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';

export class CreateDrugDto extends IntersectionType(GenericResponseDto) {
  @ApiProperty({
    example: 'Drug Name',
    description: 'The name of the drug',
  })
  @IsString()
  name: string;

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
  @IsEnum(['SOLIDS', 'LIQUIDS'])
  dosageForm: string;

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
  @IsDate()
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
    example: 'Manufacturer Name',
    description: 'The manufacturer of the drug',
  })
  @IsString()
  manufacturer: string;

  @ApiProperty({
    example: 'STOCKED',
    enum: ['LOW', 'STOCKED', 'OUT_OF_STOCK'],
    description: 'The status of the drug',
  })
  @IsEnum(['LOW', 'STOCKED', 'OUT_OF_STOCK'])
  status: string;

  @ApiProperty({
    example: 'Store in a cool, dry place',
    description: 'The storage requirements of the drug',
  })
  @IsString()
  storageReq: string;

  @ApiProperty({
    example: 'Category ID',
    description: 'The category ID of the drug',
  })
  @IsString()
  categoryId: string;
}