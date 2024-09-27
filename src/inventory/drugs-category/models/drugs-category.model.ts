import { Column, DataType, HasMany, Table } from 'sequelize-typescript';
import { Drug } from 'src/inventory/drugs/models/drug.model';
import { BaseModel } from 'src/shared/models/base.model';

@Table({
  tableName: 'drug_categories',
  underscored: true,
})
export class DrugsCategory extends BaseModel {
  @Column
  name: string;

  @Column({
    type: DataType.ENUM('ACTIVE', 'DEACTIVATED'),
    defaultValue: 'ACTIVE',
  })
  status: DrugsCategoryStatus;

  @Column({ type: DataType.INTEGER, field: 'drug_count' })
  get drugCount(): number {
    return this.drugs.length;
  }

  @HasMany(() => Drug)
  drugs: Drug[];
}

export enum DrugsCategoryStatus {
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
}
