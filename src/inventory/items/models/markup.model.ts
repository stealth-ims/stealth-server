import {
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
import { User } from '../../../auth/models/user.model';
import { AmountType, MarkupType } from '../markup/dto';

@Table({
  tableName: 'markups',
  underscored: true,
})
export class Markup extends BaseModel {
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

  @ForeignKey(() => User)
  @Column({ field: 'created_by_id' })
  createdById: string;

  @BelongsTo(() => User)
  createdBy: User;

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
