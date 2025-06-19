import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from '../../core/shared/models/base.model';
import { Batch, Item } from '../../inventory/items/models';
import { Sale } from './sales.model';
import { Facility } from '../../admin/facility/models/facility.model';
import { Department } from '../../admin/department/models/department.model';

@Table({
  tableName: 'sale_items',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class SaleItem extends BaseModel {
  @ForeignKey(() => Sale)
  @Column
  saleId: string;

  @ForeignKey(() => Item)
  @Column
  itemId: string;

  @ForeignKey(() => Batch)
  @Column
  batchId: string;

  @Column({
    type: DataType.VIRTUAL,
  })
  batchNumber: string;

  @Column
  quantity: number;

  @Column({ type: DataType.VIRTUAL })
  totalQuantity: number;

  @BelongsTo(() => Sale)
  sale: Sale;

  @BelongsTo(() => Batch)
  batch: Batch;

  @BelongsTo(() => Item)
  item: Item;

  @AllowNull
  @ForeignKey(() => Department)
  @Column
  departmentId: string;

  @BelongsTo(() => Department)
  department: Department;

  @ForeignKey(() => Facility)
  @Column
  facilityId: string;

  @BelongsTo(() => Facility)
  facility: Facility;
}
