import {
  BelongsTo,
  Column,
  DataType,
  DeletedAt,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from '../../shared/models/base.model';
import { Facility } from '../../admin/facility/models/facility.model';
import { Department } from '../../admin/department/models/department.model';

@Table({
  tableName: 'users',
  underscored: true,
})
export class User extends BaseModel {
  @Column
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column
  phoneNumber: string;

  @ForeignKey(() => Facility)
  @Column
  facilityId: string;

  @BelongsTo(() => Facility)
  facility: Facility;

  @ForeignKey(() => Department)
  @Column({ allowNull: true })
  departmentId: string;

  @BelongsTo(() => Department)
  department?: Department;

  @Column
  role: string;

  @Column
  password: string;

  @Column({ defaultValue: false })
  accountApproved: boolean;

  @Column({ defaultValue: 'ACTIVE' })
  status: string; //ACTIVE | DEACTIVATED

  @Column({ allowNull: true })
  deactivatedBy: string;

  @Column({ allowNull: true })
  deactivatedAt: Date;

  @Column({ type: DataType.STRING(400), allowNull: true })
  passwordResetCode: string;

  @Column({ allowNull: true })
  passwordResetExpires: Date;

  @DeletedAt
  @Column({ type: DataType.DATE, field: 'deleted_at' })
  deletedAt: Date;

  @Column({ type: DataType.STRING, field: 'deleted_by' })
  deletedBy: string;
}
