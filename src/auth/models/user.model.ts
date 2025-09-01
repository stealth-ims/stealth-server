import {
  AfterBulkDestroy,
  AfterBulkUpdate,
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
  AllowNull,
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  Default,
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
import { generateUsername } from '../../core/shared/factory';
import { deleteByPattern } from 'src/core/shared/modules/cache/utils/delete-prefix.util';

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
  timestamps: true,
  paranoid: true,
})
export class User extends BaseModel<User> {
  @Unique
  @Column
  username: string;

  @Column
  fullName: string;

  @Column
  email: string;

  @Column
  phoneNumber: string;

  @ForeignKey(() => Facility)
  @Column
  facilityId: string;

  @BelongsTo(() => Facility)
  facility: Facility;

  @AllowNull
  @ForeignKey(() => Department)
  @Column
  departmentId: string;

  @BelongsTo(() => Department)
  department?: Department;

  @HasMany(() => LoginSession)
  loginSessions: LoginSession;

  @Column
  role: string;

  @Column(DataType.ARRAY(DataType.STRING))
  permissions: string[];

  @Column
  password: string;

  @Default(true)
  @Column
  accountActivated: boolean;

  @Default(AccountState.PENDING)
  @Column
  status: AccountState;

  @AllowNull
  @Column
  deactivatedBy: string;

  @AllowNull
  @Column
  deactivatedAt: Date;

  @AllowNull
  @Column
  imageId: string;

  @AllowNull
  @Column
  imageUrl: string;

  @AllowNull
  @Column(DataType.STRING(400))
  resetCode: string;

  @AllowNull
  @Column
  resetCodeExpires: Date;

  @HasOne(() => Settings)
  settings: Settings;

  @BeforeCreate
  static async generateUsernameHook(instance: User) {
    if (!instance.username && instance.fullName) {
      instance.username = generateUsername(instance.fullName);
    }
  }

  @BeforeUpdate
  static async updateUsername(instance: User) {
    if (instance.changed('fullName')) {
      instance.username = generateUsername(instance.fullName);
    }
  }

  @AfterCreate
  static async afterCreateHook(instance: User) {
    await Settings.create({
      userId: instance.id,
      createdById: instance.id,
    });
  }

  @AfterCreate
  @AfterUpdate
  @AfterDestroy
  @AfterBulkUpdate
  @AfterBulkDestroy
  static async handleMutation() {
    await deleteByPattern(process.env.REDIS_URL, '*admin*');
    await deleteByPattern(process.env.REDIS_URL, '*auth*');
    await deleteByPattern(process.env.REDIS_URL, '*user*');
    await deleteByPattern(process.env.REDIS_URL, 'dashboard:general*');
  }
}
