import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  DeletedAt,
  ForeignKey,
  HasMany,
  Table,
  Unique,
} from 'sequelize-typescript';
import { BaseModel } from 'src/core/shared/models/base.model';
import { Patient } from '../../patient/models/patient.model';
import { Department } from '../../admin/department/models/department.model';
import { Facility } from '../../admin/facility/models/facility.model';
import { SaleItem } from './sale-items.model';
import { User } from '../../auth/models/user.model';

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
}

export enum SalePaymentType {
  CASH = 'CASH',
  MOMO = 'MOMO',
  ONLINE = 'ONLINE',
}

@Table({
  tableName: 'sales',
  underscored: true,
})
export class Sale extends BaseModel {
  @Unique
  @Column({ type: DataType.STRING })
  saleNumber: string;

  @Column
  paymentType: string;

  @HasMany(() => SaleItem)
  saleItems: SaleItem[];

  @Column
  subTotal: number;

  @Column
  total: number;

  @Column
  insured: boolean;

  @AllowNull
  @Column(DataType.TEXT)
  notes: string;

  @Default(PaymentStatus.PAID)
  @Column
  status: string;

  @DeletedAt
  @Column(DataType.DATE)
  deletedAt: Date;

  @Column
  deletedBy: string;

  @ForeignKey(() => Patient)
  @AllowNull
  @Column(DataType.UUID)
  patientId: string;

  @BelongsTo(() => Patient)
  patient: Patient;

  @ForeignKey(() => User)
  @AllowNull
  @Column
  createdById: string;

  @BelongsTo(() => User)
  createdBy: User;

  @ForeignKey(() => Department)
  @AllowNull
  @Column(DataType.UUID)
  departmentId: string;

  @BelongsTo(() => Department)
  department: Department;

  @ForeignKey(() => Facility)
  @Column(DataType.UUID)
  facilityId: string;

  @BelongsTo(() => Facility)
  facility: Facility;
}
