import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseModel } from 'src/shared/models/base.model';

export enum StockAdjustmentType {
  REDUCTION,
  INCREMENT,
}

export enum StockAdjustmentStatus {
  SUBMITTED,
  ADJUSTED,
  REJECTED,
}

@Table({ tableName: 'stock_adjustments', underscored: true })
export class StockAdjustment extends BaseModel {
  @Column
  @IsString()
  @IsNotEmpty()
  reason: string;

  @Column(DataType.TEXT)
  @IsString()
  notes: string;

  @Column
  status: StockAdjustmentStatus;

  @Column
  @IsNotEmpty()
  @IsEnum(StockAdjustmentType)
  type: StockAdjustmentType;

  @Column
  createdBy: string;

  @Column
  @IsNumber()
  currentStock: number;

  @Column
  @IsNumber()
  actualStock: number;

  @Column(DataType.DATE)
  dateAdded: Date;
}
