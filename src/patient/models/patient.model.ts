import { Column, DataType, HasMany, Table, Unique } from 'sequelize-typescript';
import { BaseModel } from '../../core/shared/models/base.model';
import { Sale } from '../../sales/models/sales.model';

@Table({
  tableName: 'patients',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class Patient extends BaseModel {
  @Column
  name: string;

  @Unique
  @Column
  cardIdentificationNumber: string;

  @Column(DataType.DATE)
  dateOfBirth: Date;

  @HasMany(() => Sale)
  sales: Sale[];
}
