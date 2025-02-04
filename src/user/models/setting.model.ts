import { BelongsTo, Column, ForeignKey, Table } from 'sequelize-typescript';
import { BaseModel } from '../../shared/models/base.model';
import { User } from '../../auth/models/user.model';

@Table({
  tableName: 'settings',
  underscored: true,
})
export class Settings extends BaseModel {
  @Column
  emailDepartmentRequests: boolean;

  @Column
  emailItemLowStocks: boolean;

  @Column
  emailItemOutOfStock: boolean;

  @ForeignKey(() => User)
  @Column
  userId: string;

  @BelongsTo(() => User)
  user: User;
}
