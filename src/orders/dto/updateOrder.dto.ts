import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../shared/enums/drugOrder.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateDrugOrderDto {
  @ApiPropertyOptional({
    description: 'The expected delivery date of the order',
    example: '2024-09-13T15:07:15.716764',
    required: false,
  })
  @IsOptional() // more validators will be added to this property when date format is provided
  expectedDeliveryDate?: Date;

  @ApiProperty({
    description: 'The status of the order',
    example: 'Cancelled',
    enum: OrderStatus,
    default: OrderStatus.DRAFT,
    required: false,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
