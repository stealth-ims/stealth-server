import {
  BelongsTo,
  Column,
  Default,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from '../../core/shared/models/base.model';
import { User } from '../../auth/models/user.model';

@Table({
  tableName: 'settings',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class Settings extends BaseModel {
  @Default(false)
  @Column
  emailDepartmentRequests: boolean;

  @Default(false)
  @Column
  emailItemLowStocks: boolean;

  @Default(false)
  @Column
  emailItemOutOfStock: boolean;

  @ForeignKey(() => User)
  @Column
  userId: string;

  @BelongsTo(() => User)
  user: User;
}
