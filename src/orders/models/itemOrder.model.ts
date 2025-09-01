import { BaseModel } from 'src/core/shared/models/base.model';
import {
  Table,
  Column,
  ForeignKey,
  BelongsTo,
  AllowNull,
  AfterBulkDestroy,
  AfterBulkUpdate,
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
} from 'sequelize-typescript';
import { OrderStatus } from 'src/core/shared/enums/itemOrder.enum';
import { Item } from '../../inventory/items/models';
import { Supplier } from '../../inventory/suppliers/models/supplier.model';
import { Facility } from '../../admin/facility/models/facility.model';
import { User } from 'src/auth/models/user.model';
import { deleteByPattern } from 'src/core/shared/modules/cache/utils/delete-prefix.util';
@Table({
  tableName: 'item_orders',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class ItemOrder extends BaseModel<ItemOrder> {
  @ForeignKey(() => Item)
  @Column
  itemId: string;

  @BelongsTo(() => Item)
  item: Item;

  @Column({ unique: true })
  orderNumber: string;

  @ForeignKey(() => Supplier)
  @Column
  supplierId: string;

  @BelongsTo(() => Supplier)
  supplier: Supplier;

  @Column
  quantity: number;

  @Column({
    allowNull: true,
  })
  expectedDeliveryDate: Date;

  @Column
  paymentMethod: string;

  @Column
  deliveryMethod: string;

  @Column
  deliveryAddress: string;

  @AllowNull
  @Column
  additionalNotes: string;

  @Column({ defaultValue: OrderStatus.DRAFT })
  status: OrderStatus;

  @AllowNull
  @ForeignKey(() => Facility)
  @Column
  facilityId: string;

  @BelongsTo(() => Facility)
  facility: Facility;

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
    await deleteByPattern(process.env.REDIS_URL, 'item-orders*');
  }
}
