import { PartialType } from '@nestjs/swagger';
import { CreateStockAdjustmentDto } from '.';

export class UpdateStockAdjustmentDto extends PartialType(
  CreateStockAdjustmentDto,
) {}
