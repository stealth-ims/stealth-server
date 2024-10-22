import { ApiProperty, PickType } from '@nestjs/swagger';
import { StockAdjustment } from '../model';
import { IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { CreateBatchDto } from 'src/inventory/drugs/dto';

export class BatchAdjustmentDto {
  @ApiProperty({
    description: 'The ID of the batch to adjust',
    example: '44220956-0962-4dd0-9e65-1564c585563c',
  })
  @IsUUID()
  batchId: string;

  @ApiProperty({
    example: 5,
    description: 'The quantity to adjust',
  })
  @IsNumber()
  @IsPositive()
  currentStock: number;

  @ApiProperty({
    example: 5,
    description: 'The quantity to adjust',
  })
  @IsNumber()
  @IsPositive()
  actualStock: number;
}

export class CreateStockAdjustmentDto extends PickType(StockAdjustment, [
  'reason',
  'notes',
  'type',
  'drugId',
  'dateAdded',
  'createdBy',
  'facilityId',
  'departmentId',
]) {
  @ApiProperty({
    description: 'The batches to adjust in reduction',
    type: () => BatchAdjustmentDto,
    isArray: true,
    required: false,
  })
  @IsOptional()
  affected: BatchAdjustmentDto[];

  @ApiProperty({
    description: 'The batch to create as increment',
    type: () => CreateBatchDto,
    required: false,
  })
  @IsOptional()
  batch: CreateBatchDto;
}
