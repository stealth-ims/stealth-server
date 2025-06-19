import {
  Column,
  Table,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { BaseModel } from '../../core/shared/models/base.model';
import { Facility } from '../../admin/facility/models/facility.model';
import { Department } from '../../admin/department/models/department.model';

@Table({
  tableName: 'reports',
  underscored: true,
  timestamps: true,
  paranoid: true,
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
