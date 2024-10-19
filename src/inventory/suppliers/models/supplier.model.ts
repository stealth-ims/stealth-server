import { Column, DataType, HasMany, Table } from 'sequelize-typescript';
import { Batch } from 'src/inventory/drugs/models';
import { BaseModel } from 'src/shared/models/base.model';

@Table({
  tableName: 'suppliers',
  underscored: true,
})
export class Supplier extends BaseModel {
  @Column
  name: string;

  @Column({ type: DataType.STRING, allowNull: false, field: 'contact_person' })
  contactPerson: string;

  @Column({ type: DataType.STRING, allowNull: false })
  contact: string;

  @Column({ type: DataType.STRING })
  position: string;

  @Column({ type: DataType.STRING, allowNull: false })
  type: string;

  @Column({ type: DataType.TEXT, field: 'info' })
  info: string;

  @HasMany(() => Batch)
  batches: Batch[];
}
