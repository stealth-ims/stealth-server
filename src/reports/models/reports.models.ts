import {
  Column,
  Table,
  DeletedAt,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { BaseModel } from '../../shared/models/base.model';
import { Facility } from '../../admin/facility/models/facility.model';
import { Department } from '../../admin/department/models/department.model';

@Table({
  tableName: 'reports',
  underscored: true,
})
export class Report extends BaseModel {
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

  @DeletedAt
  @AllowNull
  @Column
  deletedAt: Date;

  @AllowNull
  @Column
  deletedBy: string;

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
}
