import {
  Column,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
  AfterBulkDestroy,
  AfterBulkUpdate,
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
} from 'sequelize-typescript';
import { BaseModel } from '../../core/shared/models/base.model';
import { Item } from 'src/inventory/items/models/item.model';
import { Department } from 'src/admin/department/models/department.model';
import { Facility } from '../../admin/facility/models/facility.model';
import { User } from '../../auth/models/user.model';
import { deleteByPattern } from 'src/core/shared/modules/cache/utils/delete-prefix.util';

export enum DepartmentRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export type DepartmentRequestStatusType = keyof typeof DepartmentRequestStatus;

@Table({
  tableName: 'department_requests',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class DepartmentRequest extends BaseModel {
  @ForeignKey(() => Item)
  @Column({ type: DataType.UUID })
  itemId: string;

  @BelongsTo(() => Item)
  item: Item;

  @ForeignKey(() => Facility)
  @Column({ type: DataType.UUID })
  facilityId: string;

  @BelongsTo(() => Facility)
  facility: Department;

  @ForeignKey(() => Department)
  @Column({ type: DataType.UUID })
  departmentId: string;

  @BelongsTo(() => Department)
  department: Department;

  @Column({ type: DataType.STRING, field: 'request_number' })
  requestNumber: string;

  @Column({ type: DataType.INTEGER, field: 'quantity' })
  quantity: number;

  @Column({
    type: DataType.ENUM(...Object.values(DepartmentRequestStatus)),
    field: 'status',
  })
  status: DepartmentRequestStatusType;

  @Column({ type: DataType.TEXT, field: 'additional_notes' })
  additionalNotes: string;

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
    await deleteByPattern(process.env.REDIS_URL, '*requests*');
  }
}
