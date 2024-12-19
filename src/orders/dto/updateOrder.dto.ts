import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateItemOrderDto } from './createOrder.dto';
import { OrderStatus } from '../../shared/enums/itemOrder.enum';

import { IsEnum } from 'class-validator';

export class UpdateItemOrderDto extends PartialType(CreateItemOrderDto) {}

export class ChangeOrderStatusDto {
  @ApiProperty({
    description: 'The status of the order for the item',
    example: 'requested',
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
