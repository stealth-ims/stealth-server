import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { Department } from 'src/admin/department/models/department.model';
import { Facility } from 'src/admin/facility/models/facility.model';
import { Item } from 'src/inventory/items/models';
import { BaseModel } from 'src/shared/models/base.model';
import { ApiProperty } from '@nestjs/swagger';
import { BatchAdjustmentDto } from '../dto';

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
  paranoid: true,
  timestamps: true,
})
export class StockAdjustment extends BaseModel {
  @ApiProperty({
    example: 'Expired stock',
    description: 'The reason for the stock adjustment',
  })
  @Column
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    example: 'Additional details about the adjustment',
    description: 'Notes about the stock adjustment',
  })
  @Column(DataType.TEXT)
  @IsString()
  notes: string;

  @ApiProperty({
    example: StockAdjustmentStatus.SUBMITTED,
    enum: StockAdjustmentStatus,
    description: 'The status of the stock adjustment',
  })
  @Column
  status: StockAdjustmentStatus;

  @ApiProperty({
    example: StockAdjustmentType.REDUCTION,
    enum: StockAdjustmentType,
    description: 'The type of stock adjustment',
  })
  @Column
  @IsNotEmpty()
  @IsEnum(StockAdjustmentType)
  type: StockAdjustmentType;

  @ApiProperty({
    example: 'Kratos Godson',
    description: 'The user who created the stock adjustment',
  })
  @IsString()
  @Column
  createdBy: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  affected: BatchAdjustmentDto[];

  @ApiProperty({
    example: '2023-05-15T10:30:00Z',
    description: 'The date when the stock adjustment was added',
  })
  @IsDateString()
  @Column(DataType.DATE)
  dateAdded: Date;

  // relationships
  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'The ID of the drug being adjusted',
  })
  @ForeignKey(() => Item)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @IsUUID()
  drugId: string;

  @ApiProperty({
    type: () => Item,
    description: 'The drug associated with this stock adjustment',
  })
  @BelongsTo(() => Item)
  drug: Item;

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'The ID of the facility where the adjustment is made',
  })
  @IsUUID()
  @IsOptional()
  @ForeignKey(() => Facility)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  facilityId: string;

  @BelongsTo(() => Facility)
  facility: Facility;

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'The ID of the department where the adjustment is made',
  })
  @IsUUID()
  @IsOptional()
  @ForeignKey(() => Department)
  @Column({
    type: DataType.UUID,
  })
  departmentId: string;

  @BelongsTo(() => Department)
  department: Department;
}
