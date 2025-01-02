import { PartialType, PickType } from '@nestjs/swagger';
import { CreateStockAdjustmentDto } from './create-stock-adjustment.dto';

export class UpdateStockAdjustmentDto extends PartialType(
  PickType(CreateStockAdjustmentDto, ['reason', 'notes']),
) {}
