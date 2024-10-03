import { IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { Department } from 'src/admin/department/models/department.model';
import { BaseModel } from 'src/shared/models/base.model';

@Table({ tableName: 'stock_requests', underscored: true })
export class StockRequest extends BaseModel {
  @Column
  @IsNotEmpty()
  requestId: string;

  @Column(DataType.UUID)
  @IsNotEmpty()
  @IsUUID()
  drugId: string;

  @ForeignKey(() => Department)
  @Column(DataType.UUID)
  @IsUUID()
  @IsNotEmpty()
  departmentId: string;

  @BelongsTo(() => Department)
  department: Department;

  @Column
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @Column
  status: StockRequestStaus;

  @Column(DataType.TEXT)
  @IsOptional()
  notes: string;
}

export enum StockRequestStaus {
  DELIVERED,
  RECEIVED,
  PENDING,
  CONFIRMED,
}
