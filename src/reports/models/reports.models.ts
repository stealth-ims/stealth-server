import { Column, Table, DataType, DeletedAt } from 'sequelize-typescript';
import { BaseModel } from '../../shared/models/base.model';

export enum ReportLayout {
  PORTRAIT = 'PORTRAIT',
  LANDSCAPE = 'LANDSCAPE',
}

export type ReportLayoutType = keyof typeof ReportLayout;

@Table({
  tableName: 'reports',
  underscored: true,
})
export class Report extends BaseModel {
  @Column({ type: DataType.STRING, field: 'report_name' })
  reportName: string;

  @Column({ type: DataType.STRING, field: 'name_in_export' })
  nameInExport: string;

  @Column({ type: DataType.DATE, field: 'start_date' })
  startDate: Date;

  @Column({ type: DataType.DATE, field: 'end_date' })
  endDate: Date;

  @DeletedAt
  @Column({ type: DataType.DATE, field: 'deleted_at' })
  deletedAt: Date;

  @Column({ type: DataType.STRING, field: 'deleted_by' })
  deletedBy: string;

  @Column({
    type: DataType.ENUM(...Object.values(ReportLayout)),
    defaultValue: 'PORTRAIT',
    field: 'report_layout',
  })
  reportLayout: ReportLayoutType;
}
