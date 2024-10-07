import {
  Column,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { BaseModel } from '../../shared/models/base.model';
import { Drug } from 'src/inventory/drugs/models/drug.model';
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
})
export class DepartmentRequest extends BaseModel {
  @ForeignKey(() => Drug)
  @Column({ type: DataType.UUID, field: 'drug_id' })
  drugId: string;

  @BelongsTo(() => Drug, 'drug_id')
  drug: Drug;

  @ForeignKey(() => Department)
  @Column({ type: DataType.STRING, field: 'department_id' })
  department_id: string;

  @BelongsTo(() => Department, 'department_id')
  department: Department;

  @Column({ type: DataType.STRING, field: 'request_id' })
  requestId: string;

  @Column({ type: DataType.INTEGER, field: 'quantity' })
  quantity: number;

  @Column({
    type: DataType.ENUM(...Object.values(DepartmentRequestStatus)),
    field: 'status',
  })
  status: DepartmentRequestStatusType;

  @Column({ type: DataType.TEXT, field: 'additional_notes' })
  additionalNotes: string;
}
