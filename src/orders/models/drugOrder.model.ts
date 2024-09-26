import { BaseModel } from 'src/shared/models/base.model';
import { Table, Column, DataType } from 'sequelize-typescript';

enum OrderStatus {
  REQUESTED = 'requested',
  DRAFT = 'draft',
  CANCELLED = 'cancelled',
  DELIVERING = 'delivering',
  RECEIVED = 'received',
}

@Table({
  tableName: 'drug_orders',
  underscored: true,
  paranoid: true,
})
export class DrugOrder extends BaseModel {
  @Column({ type: DataType.STRING })
  drugName: string;

  @Column({ unique: true })
  orderNumber: string;

  @Column({ type: DataType.STRING })
  supplier: string;

  @Column({ type: DataType.DATE })
  date: Date;

  @Column({ type: DataType.STRING })
  quantity: string;

  @Column({ type: DataType.DATE, allowNull: true })
  expectedDeliveryDate: Date;

  @Column({ type: DataType.STRING, defaultValue: OrderStatus.DRAFT })
  status: OrderStatus;
}
