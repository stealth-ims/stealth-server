import {
  BelongsTo,
  Column,
  DataType,
  Default,
  DeletedAt,
  ForeignKey,
  HasMany,
  HasOne,
  Table,
  Unique,
} from 'sequelize-typescript';
import { BaseModel } from '../../core/shared/models/base.model';
import { Facility } from '../../admin/facility/models/facility.model';
import { Department } from '../../admin/department/models/department.model';
import { LoginSession } from './login-session.model';
import { Settings } from '../../user/models/setting.model';

export enum AccountState {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  DECLINED = 'Declined',
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  UNVERIFIED = 'Unverified',
}
@Table({
  tableName: 'users',
  underscored: true,
  paranoid: true,
})
export class User extends BaseModel {
  @Column
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Unique
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

  @HasMany(() => LoginSession)
  loginSessions: LoginSession;

  @Column
  role: string;

  @Column({ type: DataType.ARRAY(DataType.STRING) })
  permissions: string[];

  @Column
  password: string;

  @Default(true)
  @Column
  accountActivated: boolean;

  @Column({ defaultValue: AccountState.PENDING })
  status: AccountState;

  @Column({ allowNull: true })
  deactivatedBy: string;

  @Column({ allowNull: true })
  deactivatedAt: Date;

  @Column({ allowNull: true })
  imageId: string;

  @Column({ allowNull: true })
  imageUrl: string;

  @Column({ type: DataType.STRING(400), allowNull: true })
  resetCode: string;

  @Column({ allowNull: true })
  resetCodeExpires: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  updatedBy: string;

  @DeletedAt
  @Column({ type: DataType.DATE })
  deletedAt: Date;

  @Column({ type: DataType.STRING })
  deletedBy: string;

  @HasOne(() => Settings)
  settings: Settings;
}
