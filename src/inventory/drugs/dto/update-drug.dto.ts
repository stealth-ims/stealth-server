import { PartialType, PickType } from '@nestjs/swagger';
import { CreateDrugDto } from './create-drug.dto';

export class UpdateDrugDto extends PartialType(CreateDrugDto) {}

export class AdjustPriceDto extends PickType(CreateDrugDto, [
  'costPrice',
  'sellingPrice',
]) {}
