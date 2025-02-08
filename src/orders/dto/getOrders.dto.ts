import {
  ApiPropertyOptional,
  ApiResponseProperty,
  PickType,
} from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { OrderStatus } from 'src/shared/enums/itemOrder.enum';
import { CreateItemOrderDto } from './createOrder.dto';

export class GetOrdersDto extends PaginationRequestDto {
  @ApiPropertyOptional({
    description: 'The status of the order',
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'The id of the supplier',
  })
  @IsOptional()
  @IsUUID(4)
  supplierId?: string;

  @ApiPropertyOptional({
    description: 'The id of the item',
  })
  @IsOptional()
  @IsUUID(4)
  itemId?: string;
}

export class GetItemOrdersResponseDto extends PickType(CreateItemOrderDto, [
  'id',
  'orderNumber',
  'quantity',
  'expectedDeliveryDate',
  'status',
]) {
  @ApiResponseProperty({
    example: new Date(),
  })
  date: Date;

  @ApiResponseProperty({
    example: {
      id: '235eab15-b5b5-4a89-b8ff-ca1d923d58f0',
      name: 'Supplier A',
    },
  })
  supplier: object;

  @ApiResponseProperty({
    example: {
      id: '90260104-89b7-43d2-aa0e-90c07f54974f',
      name: 'New Item',
    },
  })
  item: object;
}
export class GetItemOrderResponseDto extends CreateItemOrderDto {
  @ApiResponseProperty({
    example: {
      id: '235eab15-b5b5-4a89-b8ff-ca1d923d58f0',
      name: 'Supplier A',
    },
  })
  supplier: object;

  @ApiResponseProperty({
    example: {
      id: '90260104-89b7-43d2-aa0e-90c07f54974f',
      name: 'New Item',
    },
  })
  item: object;
}
