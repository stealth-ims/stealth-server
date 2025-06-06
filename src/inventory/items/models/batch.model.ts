import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  DeletedAt,
  ForeignKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { Supplier } from 'src/inventory/suppliers/models/supplier.model';
import { BaseModel } from 'src/core/shared/models/base.model';
import { Item } from '.';
import { User } from '../../../auth/models/user.model';
import { Department } from '../../../admin/department/models/department.model';
import { Facility } from '../../../admin/facility/models/facility.model';
import { differenceInDays, startOfToday } from 'date-fns';

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
export class Batch extends BaseModel {
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

  @Unique
  @Column
  batchNumber: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  quantity: number;

  @ForeignKey(() => User)
  @Column({ field: 'created_by_id', allowNull: true })
  createdById: string;

  @BelongsTo(() => User)
  createdBy: User;

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

  @DeletedAt
  @Column({ type: DataType.DATE, field: 'deleted_at' })
  deletedAt: Date;
}
