import {
  Column,
  Table,
  AllowNull,
  ForeignKey,
  BelongsTo,
  AfterBulkDestroy,
  AfterBulkUpdate,
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
} from 'sequelize-typescript';
import { BaseModel } from '../../core/shared/models/base.model';
import { Facility } from '../../admin/facility/models/facility.model';
import { Department } from '../../admin/department/models/department.model';
import { deleteByPattern } from 'src/core/shared/modules/cache/utils/delete-prefix.util';

@Table({
  tableName: 'reports',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class Report extends BaseModel<Report> {
  @Column
  reportType: string;

  @Column
  name: string;

  @AllowNull
  @Column
  nameInExport: string;

  @AllowNull
  @Column
  startDate: Date;

  @AllowNull
  @Column
  endDate: Date;

  @AllowNull
  @Column
  specificDate: Date;

  @ForeignKey(() => Department)
  @AllowNull
  @Column
  departmentId: string;

  @BelongsTo(() => Department)
  department: Department;

  @ForeignKey(() => Facility)
  @Column
  facilityId: string;

  @BelongsTo(() => Facility)
  facility: Facility;

  @AfterCreate
  @AfterUpdate
  @AfterDestroy
  @AfterBulkUpdate
  @AfterBulkDestroy
  static async handleMutation() {
    await deleteByPattern(process.env.REDIS_URL, 'reports*');
  }
}
