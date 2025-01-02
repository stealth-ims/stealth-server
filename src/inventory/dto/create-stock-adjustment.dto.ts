import { IntersectionType, PickType } from '@nestjs/swagger';
import { GenericResponseDto } from '../../shared/docs/dto/base.dto';
import { StockAdjustment } from '../models/stock-adjustment.model';

export class CreateStockAdjustmentDto extends PickType(StockAdjustment, [
  'itemId',
  'batchId',
  'quantity',
  'type',
  'reason',
  'notes',
  'status',
  'createdBy',
  'facilityId',
  'departmentId',
]) {}

export class CreatedAdjustmentResponseDto extends IntersectionType(
  StockAdjustment,
  GenericResponseDto,
) {}
