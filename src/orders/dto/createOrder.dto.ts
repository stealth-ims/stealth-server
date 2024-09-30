import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../shared/enums/drugOrder.enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDrugOrderDto {
  @ApiProperty({ description: 'The name of the drug', example: 'Paracetamol' })
  @IsNotEmpty()
  @IsString()
  drugName: string;

  @ApiProperty({
    description: 'The order number',
    example: 'ORD-12345',
    uniqueItems: true,
  })
  @IsNotEmpty()
  @IsString()
  orderNumber: string;

  @ApiProperty({
    description: 'The name of the supplier',
    example: 'Pharma Inc.',
  })
  @IsNotEmpty()
  @IsString()
  supplier: string;

  @ApiProperty({
    description: 'The date of the order',
    example: '2024-09-13T15:07:15.716764',
  })
  @IsNotEmpty()
  dateCreated: Date;

  @ApiProperty({ description: 'The quantity of the drug', example: '1000pcs' })
  @IsNotEmpty()
  @IsString()
  quantity: string;

  @ApiPropertyOptional({
    description: 'The expected delivery date of the order',
    example: '2023-09-15',
  })
  @IsOptional()
  expectedDeliveryDate?: Date;

  @ApiProperty({
    description: 'The status of the order',
    enum: OrderStatus,
    default: OrderStatus.DRAFT,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
