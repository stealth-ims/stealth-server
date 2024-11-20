import {
  Column,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
  DeletedAt,
} from 'sequelize-typescript';
import { BaseModel } from '../../shared/models/base.model';
import { Item } from 'src/inventory/items/models/item.model';
import { Department } from 'src/admin/department/models/department.model';

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
})
export class DepartmentRequest extends BaseModel {
  @ForeignKey(() => Item)
  @Column({ type: DataType.UUID, field: 'drug_id' })
  drugId: string;

  @BelongsTo(() => Item, 'drug_id')
  drug: Item;

  @ForeignKey(() => Department)
  @Column({ type: DataType.STRING, field: 'department_id' })
  departmentId: string;

  @BelongsTo(() => Department, 'department_id')
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

  @DeletedAt
  @Column({ type: DataType.DATE, field: 'deleted_at' })
  deletedAt: Date;

  @Column({ type: DataType.STRING, field: 'deleted_by' })
  deletedBy: string;
}
