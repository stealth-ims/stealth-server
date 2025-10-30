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
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { GenericResponseDto } from 'src/core/shared/dto/base.dto';
import { PaymentStatus, SalePaymentType } from '../models/sales.model';
import { BatchExists, PatientExists } from '../../core/shared/validators';
import { Transform } from 'class-transformer';

const EmptyToUndefined = () =>
  Transform(({ value }) => (value === '' ? undefined : value));

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

  itemId: string;
}

export class CreateSaleDto {
  @ApiPropertyOptional({
    example: '0723e7a1-ec12-4cdb-b4d5-6169dba540c6',
    description: "The Patient's unique identifier in database",
  })
  @IsOptional()
  @EmptyToUndefined()
  @PatientExists()
  patientId?: string;

  @ApiProperty({
    example: ['CASH'],
    enum: SalePaymentType,
    description: 'The type of payment for the sale',
  })
  @IsNotEmpty()
  @IsArray()
  @IsEnum(SalePaymentType, { each: true })
  paymentType: SalePaymentType[];

  @ApiPropertyOptional({
    example: true,
    description: 'Is the patient insured',
  })
  @IsNotEmpty()
  @IsBoolean()
  insured: boolean;

  @ApiPropertyOptional({
    example: 'A00',
    description: 'ICD code for the diagnosis',
  })
  @IsOptional()
  @IsString()
  icdCode?: string;

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
  notes?: string;

  @ApiResponseProperty({
    example: 'gh-56387082875',
  })
  patientCardId?: string;

  @ApiResponseProperty({
    example: 'S-1234',
  })
  saleNumber?: string;

  @ApiResponseProperty({
    example: 'PAID',
    enum: PaymentStatus,
  })
  status?: PaymentStatus;

  @ApiResponseProperty({
    example: 1600.0,
  })
  subTotal?: number;

  @ApiResponseProperty({
    example: 1600.0,
  })
  total?: number;
}

export class BaseCreateSale<T> extends PartialType(
  OmitType(CreateSaleDto, ['notes', 'saleItems']),
) {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  saleItems: T[];

  @IsOptional()
  createdById?: string;

  @IsNotEmpty()
  departmentId: string;

  @IsNotEmpty()
  facilityId: string;
}

export class SmsCreateSale extends BaseCreateSale<{
  batchNumber: string;
  batchId?: string;
  quantity: number;
  itemId?: string;
}> {}
export class UssdCreateSale extends BaseCreateSale<{
  itemCode: string;
  quantity: number;
}> {}

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

export type BatchSellingPrice = {
  batchId: string;
  quantity: number;
  sellingPrice: number;
  nhisCovered: boolean;
};
