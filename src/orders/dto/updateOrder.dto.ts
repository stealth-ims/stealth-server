import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../shared/enums/itemOrder.enum';
import { IsDateString, IsEnum, IsOptional, MinDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateItemOrderDto {
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
    example: 'cancelled',
    enum: ['requested', 'draft', 'cancelled', 'delivering', 'received'],
    default: 'draft',
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
