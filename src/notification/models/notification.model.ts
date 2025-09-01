import {
  AfterBulkDestroy,
  AfterBulkUpdate,
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
  AllowNull,
  BelongsTo,
  Column,
  Default,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from '../../core/shared/models/base.model';
import { Facility } from '../../admin/facility/models/facility.model';
import { Department } from '../../admin/department/models/department.model';
import { Features } from '../../core/shared/enums/permissions.enum';
import { NotificationStatus } from '../enum';
import { User } from '../../auth/models/user.model';
import { deleteByPattern } from 'src/core/shared/modules/cache/utils/delete-prefix.util';

@Table({
  tableName: 'notifications',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class NotificationModel extends BaseModel<NotificationModel> {
  @Column
  message: string;

  @AllowNull
  @Column
  linkName: string;

  @AllowNull
  @Column
  linkRoute: string;

  @Column
  feature: Features;

  @Default(NotificationStatus.UNREAD)
  @Column
  status: NotificationStatus;

  @ForeignKey(() => Facility)
  @Column
  facilityId: string;

  @ForeignKey(() => Department)
  @AllowNull
  @Column
  departmentId: string;

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
    await deleteByPattern(process.env.REDIS_URL, 'notifications*');
  }
}
