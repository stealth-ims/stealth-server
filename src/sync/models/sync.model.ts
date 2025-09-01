import {
  ForeignKey,
  AllowNull,
  Column,
  DataType,
  BelongsTo,
  Table,
  AfterBulkDestroy,
  AfterBulkUpdate,
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
} from 'sequelize-typescript';
import { Department } from '../../admin/department/models/department.model';
import { Facility } from '../../admin/facility/models/facility.model';
import { User } from '../../auth/models/user.model';
import { BaseModel } from '../../core/shared/models/base.model';
import { IncomingHttpHeaders } from 'http';
import { RequestMethods } from '../dto';
import { deleteByPattern } from 'src/core/shared/modules/cache/utils/delete-prefix.util';

@Table({
  tableName: 'sync_requests',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class SyncRequest extends BaseModel<SyncRequest> {
  @Column
  method: RequestMethods;

  @Column
  url: string;

  @AllowNull
  @Column(DataType.JSONB)
  body: Record<string, any>;

  @Column(DataType.JSONB)
  headers: IncomingHttpHeaders;

  @Column
  action: string;

  @Column
  message: string;

  @Column
  statusCode: number;

  @AllowNull
  @ForeignKey(() => Department)
  @Column(DataType.UUID)
  departmentId: string;

  @BelongsTo(() => Department)
  department: Department;

  @ForeignKey(() => Facility)
  @Column(DataType.UUID)
  facilityId: string;

  @BelongsTo(() => Facility)
  facility: Facility;

  @ForeignKey(() => User)
  @Column
  createdById: string;

  @BelongsTo(() => User)
  createdBy: User;

  @ForeignKey(() => User)
  @Column
  updatedById: string;

  @BelongsTo(() => User)
  updatedBy: User;

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
    await deleteByPattern(process.env.REDIS_URL, 'sync*');
  }
}
