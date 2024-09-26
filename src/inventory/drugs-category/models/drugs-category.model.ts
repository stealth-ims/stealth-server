import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseModel } from 'src/shared/models/base.model';

@Table({
  tableName: 'drug_categories',
  underscored: true,
})
export class DrugsCategory extends BaseModel {
  @Column
  name: string;

  @Column({ type: DataType.DATEONLY })
  date: Date;

  @Column({ type: DataType.ENUM('ACTIVE', 'DEACTIVATED'), defaultValue: 'ACTIVE' })
  status: DrugsCategoryStatus;

  @Column({ type: DataType.INTEGER, field: 'drug_count' })
  drugCount: number;
}

export enum DrugsCategoryStatus {
  ACTIVE = "ACTIVE",
  DEACTIVATED = "DEACTIVATED"
}