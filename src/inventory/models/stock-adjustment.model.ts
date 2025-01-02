import { IsEnum, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { Department } from 'src/admin/department/models/department.model';
import { Facility } from 'src/admin/facility/models/facility.model';
import { Batch, Item } from 'src/inventory/items/models';
import { BaseModel } from 'src/shared/models/base.model';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

export enum StockAdjustmentType {
  REDUCTION = 'REDUCTION',
  INCREMENT = 'INCREMENT',
}

export enum StockAdjustmentStatus {
  SUBMITTED = 'SUBMITTED',
  ADJUSTED = 'ADJUSTED',
  REJECTED = 'REJECTED',
}

@Table({
  tableName: 'stock_adjustments',
  underscored: true,
  timestamps: true,
})
export class StockAdjustment extends BaseModel {
  @ApiProperty({
    example: 100,
    description: 'The quantity being adjusted',
  })
  @Column
  @IsNotEmpty()
  @Min(0)
  quantity: number;

  @ApiProperty({
    example: StockAdjustmentType.REDUCTION,
    enum: StockAdjustmentType,
    description: 'The type of stock adjustment',
  })
  @IsNotEmpty()
  @IsEnum(StockAdjustmentType)
  @Column
  type: StockAdjustmentType;

  @ApiProperty({
    example: 'Expired stock',
    description: 'The reason for the stock adjustment',
  })
  @IsString()
  @IsNotEmpty()
  @Column
  reason: string;

  @ApiProperty({
    example: 'Additional details about the adjustment',
    description: 'Notes about the stock adjustment',
  })
  @Column(DataType.TEXT)
  @IsNotEmpty()
  notes: string;

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'The ID of the item being adjusted',
  })
  @ForeignKey(() => Item)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @IsNotEmpty()
  @IsUUID()
  itemId: string;

  @BelongsTo(() => Item)
  item: Item;

  @ApiProperty({
    example: 'fr220956-0962-4de0-9e65-1564c585563c',
    description: 'The ID of the affected batch',
  })
  @ForeignKey(() => Batch)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @IsNotEmpty()
  @IsUUID()
  batchId: string;

  @BelongsTo(() => Batch)
  batch: Batch;

  @ApiResponseProperty({
    example: StockAdjustmentStatus.ADJUSTED,
    enum: StockAdjustmentStatus,
  })
  @Column
  status: StockAdjustmentStatus;

  @ApiResponseProperty({
    example: 'Kratos Godson,96fdc209-0551-4d67-b9ad-0e9067a44bc4',
  })
  @Column
  createdBy: string;

  @ApiResponseProperty({
    example: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
  })
  @ForeignKey(() => Facility)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  facilityId: string;

  @BelongsTo(() => Facility)
  facility: Facility;

  @ApiResponseProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
  })
  @ForeignKey(() => Department)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  departmentId: string;

  @BelongsTo(() => Department)
  department: Department;
}
