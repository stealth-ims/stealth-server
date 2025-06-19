import { BaseModel } from 'src/core/shared/models/base.model';
import {
  Table,
  Column,
  ForeignKey,
  BelongsTo,
  AllowNull,
} from 'sequelize-typescript';
import { OrderStatus } from 'src/core/shared/enums/itemOrder.enum';
import { Item } from '../../inventory/items/models';
import { Supplier } from '../../inventory/suppliers/models/supplier.model';
import { Facility } from '../../admin/facility/models/facility.model';
@Table({
  tableName: 'item_orders',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class ItemOrder extends BaseModel {
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
}
