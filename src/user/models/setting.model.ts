import {
  BelongsTo,
  Column,
  Default,
  ForeignKey,
  Table,
  AllowNull,
  AfterBulkDestroy,
  AfterBulkUpdate,
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
} from 'sequelize-typescript';
import { BaseModel } from '../../core/shared/models/base.model';
import { User } from '../../auth/models/user.model';
import { deleteByPattern } from 'src/core/shared/modules/cache/utils/delete-prefix.util';

@Table({
  tableName: 'settings',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class Settings extends BaseModel<Settings> {
  @Default(false)
  @Column
  emailDepartmentRequests: boolean;

  @Default(false)
  @Column
  emailItemStocked: boolean;

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

  @AllowNull
  @ForeignKey(() => User)
  @Column
  createdById: string;

  @BelongsTo(() => User)
  createdBy: User;

  @AllowNull
  @ForeignKey(() => User)
  @Column
  updatedById: string;

  @BelongsTo(() => User)
  updatedBy: User;

  @AllowNull
  @ForeignKey(() => User)
  @Column
  deletedById: string;

  @BelongsTo(() => User)
  deletedBy: User;

  @AfterCreate
  @AfterUpdate
  @AfterDestroy
  @AfterBulkUpdate
  @AfterBulkDestroy
  static async handleMutation() {
    await deleteByPattern(process.env.REDIS_URL, '*settings*');
  }
}
