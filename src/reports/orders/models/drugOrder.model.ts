import { BaseModel } from 'src/shared/models/base.model';
import { Table, Column, DataType } from 'sequelize-typescript';
import { OrderStatus } from 'src/shared/enums/itemOrder.enum';
@Table({
  tableName: 'item_orders',
  underscored: true,
  paranoid: true,
})
export class ItemOrder extends BaseModel {
  @Column({ type: DataType.STRING, field: 'item_name' })
  itemName: string;

  @Column({ unique: true, field: 'order_number' })
  orderNumber: string;

  @Column({ type: DataType.STRING })
  supplier: string;

  @Column({ type: DataType.DATE })
  date: Date;

  @Column({ type: DataType.STRING })
  quantity: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'expected_delivery_date',
  })
  expectedDeliveryDate: Date;

  @Column({ type: DataType.STRING, defaultValue: OrderStatus.DRAFT })
  status: OrderStatus;
}
