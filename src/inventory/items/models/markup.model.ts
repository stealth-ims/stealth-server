import {
  AfterBulkDestroy,
  AfterBulkUpdate,
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from '../../../core/shared/models/base.model';
import { Department } from '../../../admin/department/models/department.model';
import { Facility } from '../../../admin/facility/models/facility.model';
import { Batch } from './batch.model';
import { Item } from '.';
import { AmountType, MarkupType } from '../markup/dto';
import { User } from '../../../auth/models/user.model';
import { deleteByPattern } from 'src/core/shared/modules/cache/utils/delete-prefix.util';

@Table({
  tableName: 'markups',
  underscored: true,
  paranoid: true,
  timestamps: true,
})
export class Markup extends BaseModel<Markup> {
  @Column
  type: MarkupType;

  @Column
  amountType: AmountType;

  @Column
  amount: number;

  @ForeignKey(() => Batch)
  @Column
  batchId: string;

  @BelongsTo(() => Batch)
  batch: Batch;

  @ForeignKey(() => Item)
  @Column
  itemId: string;

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
    await deleteByPattern(process.env.REDIS_URL, '*markup*');
  }
}
