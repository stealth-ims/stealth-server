import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  DeletedAt,
  ForeignKey,
  HasMany,
  Table,
  Unique,
} from 'sequelize-typescript';
import { BaseModel } from '../../core/shared/models/base.model';
import { Sale } from '../../sales/models/sales.models';
import { User } from '../../auth/models/user.model';

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

  @ForeignKey(() => User)
  @Column({ field: 'created_by_id' })
  createdById: string;

  @BelongsTo(() => User)
  createdBy: User;

  @DeletedAt
  @Column
  deletedAt: Date;

  @AllowNull
  @Column
  deletedBy: string;

  @HasMany(() => Sale)
  sales: Sale[];
}
