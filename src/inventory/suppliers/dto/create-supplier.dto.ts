import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
} from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsEmail,
} from 'class-validator';
import { GenericResponseDto } from '../../../core/shared/dto/base.dto';
import { StatusType } from '../models/supplier.model';
enum PaymentType {
  BANK = 'Bank',
  MOBILE_MONEY = 'Mobile Money',
}

enum ProviderType {
  MTN = 'MTN',
  VODAFONE = 'Vodafone',
  AIRTELTIGO = 'Airteltigo',
}

export class CreateSupplierDto extends GenericResponseDto {
  @ApiProperty({
    description: 'The official name of the supplier.',
    example: 'FreshFarm Supplies Ltd',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'The name under which the supplier operates commercially.',
    example: 'FreshFarm',
  })
  @IsOptional()
  @IsString()
  brandTradeName?: string;

  @ApiProperty({
    description:
      'Indicates what kind of supplier this is, such as manufacturer, distributor, or wholesaler.',
    example: 'Wholesaler',
  })
  @IsString()
  supplierType: string;

  @ApiProperty({
    description:
      'The minimum quantity of items the supplier is willing to supply per order.',
    example: 100,
  })
  @IsNumber()
  minimumOrderQuantity: number;

  @ApiProperty({
    description:
      'The number of days between placing an order and receiving it.',
    example: '7 days',
  })
  @IsString()
  leadTime: string;

  @ApiProperty({
    description:
      'The preferred method of delivery the supplier uses, such as courier, freight, or self-delivery.',
    example: 'Courier',
  })
  @IsString()
  deliveryMethod: string;

  // Contact Details
  @ApiProperty({
    description: 'The main point of contact at the supplier.',
    example: 'John Doe',
  })
  @IsString()
  primaryContactName: string;

  @ApiProperty({
    description: 'The position or title of the primary contact at the company.',
    example: 'Sales Manager',
  })
  @IsString()
  jobTitle: string;

  @ApiProperty({
    description:
      'The department within the supplier’s organization the primary contact belongs to.',
    example: 'Sales',
  })
  @IsString()
  department: string;

  @ApiProperty({
    description: 'The primary phone number of the contact person.',
    example: '+233555538672',
  })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'The contact person’s email address.',
    example: 'johndoe@freshfarm.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The physical location of the supplier.',
    example: '123 Market Street, Springfield',
  })
  @IsString()
  physicalAddress: string;

  @ApiPropertyOptional({
    description:
      'The address for correspondence, if different from the physical address.',
    example: 'P.O. Box 456, Springfield',
  })
  @IsOptional()
  @IsString()
  mailingAddress?: string;

  @ApiPropertyOptional({
    description: "The emergency contact's name",
    example: 'James Ofori',
  })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiPropertyOptional({
    description: "The emergency contact's title",
    example: 'Sales Manager',
  })
  @IsOptional()
  @IsString()
  emergencyContactTitle?: string;

  @ApiPropertyOptional({
    description: "The emergency contact's contact number",
    example: '+23355677835',
  })
  @IsOptional()
  @IsString()
  emergencyContactNumber?: string;

  // Payment Type
  @ApiProperty({
    description: 'The provider through which payments is made',
    example: 'Bank',
    enum: PaymentType,
  })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiProperty({
    description: 'The currency in which payments to the supplier will be made.',
    example: 'USD',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description:
      'The terms agreed upon for payment (e.g., 30 days net, payment on delivery).',
    example: 'Net 30 Days',
  })
  @IsString()
  paymentTerms: string;

  // Bank Details (if payment type is bank)
  @ApiPropertyOptional({
    description: "The name of the supplier's bank.",
    example: 'Bank of America',
  })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({
    description: 'The type of the bank account (e.g., savings, checking).',
    example: 'Checking',
  })
  @IsOptional()
  @IsString()
  accountType?: string;

  @ApiPropertyOptional({
    description: 'The bank account number where payments will be deposited.',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  // Mobile Money Details (if payment type is mobile money)
  @ApiPropertyOptional({
    description: 'The mobile money provider (e.g., MTN, Vodafone).',
    example: 'MTN',
    enum: ProviderType,
  })
  @IsOptional()
  @IsEnum(ProviderType)
  provider?: ProviderType;

  @ApiPropertyOptional({
    description: 'The mobile money phone number used for transactions.',
    example: '+233552986758',
  })
  @IsOptional()
  @IsString()
  mobileMoneyPhoneNumber?: string;

  @ApiResponseProperty({
    example: 'Active',
  })
  status: StatusType;

  @ApiResponseProperty({
    example: 'Accra',
  })
  city: string;
}
