import { BaseModel } from 'src/shared/models/base.model';
import { Table, Column, DataType } from 'sequelize-typescript';
import { OrderStatus } from 'src/shared/enums/drugOrder.enum';
@Table({
  tableName: 'drug_orders',
  underscored: true,
  paranoid: true,
})
export class DrugOrder extends BaseModel {
  @Column({ type: DataType.STRING, field: 'drug_name' })
  drugName: string;

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
