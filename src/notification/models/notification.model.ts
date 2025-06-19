import {
  AllowNull,
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

@Table({
  tableName: 'notifications',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class NotificationModel extends BaseModel {
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
}
