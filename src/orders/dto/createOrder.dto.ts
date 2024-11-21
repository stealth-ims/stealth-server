import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../shared/enums/itemOrder.enum';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemOrderDto {
  @ApiProperty({ description: 'The name of the item', example: 'Paracetamol' })
  @IsNotEmpty()
  @IsString()
  itemName: string;

  @ApiProperty({
    description: 'The name of the supplier',
    example: 'Pharma Inc.',
  })
  @IsNotEmpty()
  @IsString()
  supplier: string;

  @ApiProperty({
    description: 'The date of the order',
    example: new Date().toISOString(), // ensures correct, consistent date format despite system differences
  })
  @IsNotEmpty()
  dateCreated: Date;

  @ApiProperty({ description: 'The quantity of the item', example: 1000 })
  @IsNotEmpty()
  @IsString()
  quantity: number;

  @ApiPropertyOptional({
    description: 'The expected delivery date of the order',
    example: new Date().toISOString(),
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  @MinDate(new Date())
  expectedDeliveryDate?: Date;

  @ApiProperty({
    description: 'The status of the order',
    example: 'completed',
    enum: ['requested', 'draft', 'cancelled', 'delivering', 'received'],
    default: 'draft',
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
