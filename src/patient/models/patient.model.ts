import {
  AllowNull,
  Column,
  DataType,
  DeletedAt,
  HasMany,
  Table,
  Unique,
} from 'sequelize-typescript';
import { BaseModel } from '../../shared/models/base.model';
import { Sale } from '../../sales/models/sales.models';

@Table({
  tableName: 'patients',
  underscored: true,
})
export class Patient extends BaseModel {
  @Column
  name: string;

  @Unique
  @Column
  cardIdentificationNumber: string;

  @Column(DataType.DATE)
  dateOfBirth: Date;

  @Column
  createdBy: string;

  @DeletedAt
  @Column
  deletedAt: Date;

  @AllowNull
  @Column
  deletedBy: string;

  @HasMany(() => Sale)
  sales: Sale[];
}
