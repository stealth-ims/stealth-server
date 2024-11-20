import { PartialType, PickType } from '@nestjs/swagger';
import { CreateItemDto } from './create-item.dto';

export class UpdateItemDto extends PartialType(CreateItemDto) {}

export class AdjustPriceDto extends PickType(CreateItemDto, [
  'costPrice',
  'sellingPrice',
]) {}
