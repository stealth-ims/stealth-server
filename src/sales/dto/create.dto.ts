import { ApiProperty, ApiResponseProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import { PaymentStatus, PaymentStatusType } from '../models/sales.models';

export class CreateSaleDto extends GenericResponseDto {
  @ApiProperty({
    example: 'f7b1a1a9-7f0e-4f0e-9f0e-7f0e7f0e7f0e',
    description: 'The Id of the selected item',
  })
  @IsUUID(4)
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the patient',
  })
  @IsString()
  @IsNotEmpty()
  patientName: string;

  @ApiProperty({
    example: 4,
    description: 'The quantity of the sold item',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: 'UNPAID',
    enum: PaymentStatus,
  })
  status: PaymentStatusType;

  @ApiResponseProperty({
    example: 'S-1234',
  })
  saleNumber: string;
}

export class UpdateSalesDto extends PartialType(CreateSaleDto) {}
