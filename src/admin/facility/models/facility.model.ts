import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from 'src/core/shared/models/base.model';
import { User } from 'src/auth/models/user.model';
// import { Item } from '../../../inventory/items/models/item.model';
import { Department } from '../../department/models/department.model';
import { StockAdjustment } from 'src/inventory/models/stock-adjustment.model';
import { IntervalUnit } from '../dto';

@Table({
  tableName: 'facilities',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class Facility extends BaseModel<Facility> {
  @Column
  name: string;

  @AllowNull
  @Column
  email: string;

  @Column
  password: string;

  @AllowNull
  @Column
  region: string;

  @AllowNull
  @Column
  location: string;

  @Default('60 days')
  @Column
  expiryInterval: string;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Facility) {
      return +this.expiryInterval.split(/\s+/)[0];
    },
  })
  intervalQuantity: number;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Facility) {
      return this.expiryInterval.split(/\s+/)[1] as IntervalUnit;
    },
  })
  intervalUnit: IntervalUnit;

  @HasMany(() => Department)
  departments: Department[];

  @HasMany(() => User)
  workers: User[];

  @HasMany(() => StockAdjustment)
  stockAdjustments: StockAdjustment[];

  // @HasMany(() => Item)
  // items: Item[];

  @ForeignKey(() => User)
  @Column
  createdById: string;

  @BelongsTo(() => User)
  createdBy: User;

  @ForeignKey(() => User)
  @Column
  updatedById: string;

  @BelongsTo(() => User)
  updatedBy: User;

  @ForeignKey(() => User)
  @Column
  deletedById: string;

  @BelongsTo(() => User)
  deletedBy: User;
}
