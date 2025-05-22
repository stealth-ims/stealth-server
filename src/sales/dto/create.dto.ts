import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
  IntersectionType,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';
import { GenericResponseDto } from 'src/core/shared/docs/dto/base.dto';
import { PaymentStatus, SalePaymentType } from '../models/sales.models';
import { BatchExists, PatientExists } from '../../core/shared/validators';

export class CreateSaleItemsDto {
  @ApiProperty({
    example: '43cc0259-0c07-44c6-a4f5-0201fcb2d55d',
    description: 'Id of the item batch',
  })
  @IsNotEmpty()
  @BatchExists()
  batchId: string;

  @ApiProperty({
    example: 100,
    description: 'Quantity of the item to be purchased',
  })
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}

export class CreateSaleDto {
  @ApiPropertyOptional({
    example: 'gh-56387082875',
    description: 'The card identification number of the selected patient',
  })
  @IsOptional()
  @PatientExists()
  patientCardId: string;

  @ApiProperty({
    example: 'CASH',
    enum: SalePaymentType,
    description: 'The type of payment for the sale',
  })
  @IsNotEmpty()
  @IsEnum(SalePaymentType)
  paymentType: SalePaymentType;

  @ApiProperty({
    type: [CreateSaleItemsDto],
    description: 'The items sold and their quantities',
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  saleItems: CreateSaleItemsDto[];

  @ApiPropertyOptional({
    example: 'To be refilled next month',
    description: 'Additional notes for the sale',
  })
  @IsOptional()
  notes: string;

  @ApiResponseProperty({
    example: '0723e7a1-ec12-4cdb-b4d5-6169dba540c6',
  })
  patientId: string;

  @ApiResponseProperty({
    example: 'S-1234',
  })
  saleNumber: string;

  @ApiResponseProperty({
    example: 'PAID',
    enum: PaymentStatus,
  })
  status: PaymentStatus;

  @ApiResponseProperty({
    example: 1600.0,
  })
  subTotal: number;

  @ApiResponseProperty({
    example: 1600.0,
  })
  total: number;
}

export class CreateSaleResponseDto extends IntersectionType(
  GenericResponseDto,
  OmitType(CreateSaleDto, ['patientCardId']),
) {
  @ApiResponseProperty({
    example: '34a7159b-94bc-40c3-a710-3aba911e9289',
  })
  departmentId: string;

  @ApiResponseProperty({
    example: '34a7159b-94bc-40c3-a710-3aba911e9289',
  })
  facilityId: string;

  @ApiResponseProperty({
    example: null,
  })
  deletedAt: Date;

  @ApiResponseProperty({
    example: null,
  })
  deletedBy: string;
}

export class UpdateSalesDto extends PartialType(CreateSaleDto) {}
