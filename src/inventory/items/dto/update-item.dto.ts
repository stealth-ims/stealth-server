import { PartialType, PickType } from '@nestjs/swagger';
import { CreateBatchDto, CreateItemDto } from './create-item.dto';

export class UpdateItemDto extends PartialType(CreateItemDto) {}

export class UpdateBatchDto extends PartialType(CreateBatchDto) {}
export class AdjustPriceDto extends PickType(CreateItemDto, [
  'costPrice',
  'sellingPrice',
]) {}
