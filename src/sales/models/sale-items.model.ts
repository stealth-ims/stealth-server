import {
  AfterBulkDestroy,
  AfterBulkUpdate,
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
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
import { User } from '../../auth/models/user.model';
import { deleteByPattern } from 'src/core/shared/modules/cache/utils/delete-prefix.util';

@Table({
  tableName: 'sale_items',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class SaleItem extends BaseModel<SaleItem> {
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

  @Column
  nhisCovered: boolean;

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

  @ForeignKey(() => User)
  @Column
  createdById: string;

  @BelongsTo(() => User)
  createdBy: User;

  @ForeignKey(() => User)
  @Column
  updatedById: string;

  @BelongsTo(() => User)
  updatedBy: User;

  @ForeignKey(() => User)
  @Column
  deletedById: string;

  @BelongsTo(() => User)
  deletedBy: User;

  @AfterCreate
  @AfterUpdate
  @AfterDestroy
  @AfterBulkUpdate
  @AfterBulkDestroy
  static async handleMutation() {
    await deleteByPattern(process.env.REDIS_URL, '*sales*');
  }
}
