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
  HasOne,
  Table,
} from 'sequelize-typescript';
import { Supplier } from 'src/inventory/suppliers/models/supplier.model';
import { BaseModel } from 'src/core/shared/models/base.model';
import { Item, Markup } from '.';
import { Department } from '../../../admin/department/models/department.model';
import { Facility } from '../../../admin/facility/models/facility.model';
import { differenceInDays, startOfToday } from 'date-fns';
import { User } from 'src/auth/models/user.model';
import { deleteByPattern } from 'src/core/shared/modules/cache/utils/delete-prefix.util';

export enum BatchValidityStatus {
  EXPIRED = 'EXPIRED',
  CRITICAL = 'CRITICAL',
  APPROACHING = 'APPROACHING',
  SAFE = 'SAFE',
}
@Table({
  tableName: 'batches',
  underscored: true,
  paranoid: true,
  timestamps: true,
})
export class Batch extends BaseModel<Batch> {
  @ForeignKey(() => Item)
  @Column
  itemId: string;

  @BelongsTo(() => Item)
  item: Item;

  @Column({ type: DataType.DATE, allowNull: false })
  validity: Date;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Batch) {
      let status: BatchValidityStatus;

      const daysDifference = differenceInDays(this.validity, startOfToday());
      if (daysDifference < 0) {
        status = BatchValidityStatus.EXPIRED;
      } else if (daysDifference <= 30) {
        status = BatchValidityStatus.CRITICAL;
      } else if (daysDifference <= 90) {
        status = BatchValidityStatus.APPROACHING;
      } else {
        status = BatchValidityStatus.SAFE;
      }
      return status;
    },
  })
  status: BatchValidityStatus;

  @Column
  batchNumber: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  quantity: number;

  @AllowNull
  @ForeignKey(() => Supplier)
  @Column
  supplierId: string;

  @BelongsTo(() => Supplier)
  supplier: Supplier;

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

  @HasOne(() => Markup)
  markup: Markup;

  @AllowNull
  @ForeignKey(() => User)
  @Column
  createdById: string;

  @BelongsTo(() => User)
  createdBy: User;

  @AllowNull
  @ForeignKey(() => User)
  @Column
  updatedById: string;

  @BelongsTo(() => User)
  updatedBy: User;

  @AllowNull
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
    await deleteByPattern(process.env.REDIS_URL, '*batches*');
    await deleteByPattern(process.env.REDIS_URL, 'dashboard:general*');
  }
}
