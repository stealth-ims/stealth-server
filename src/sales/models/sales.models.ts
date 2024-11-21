import {
  BelongsTo,
  Column,
  DataType,
  DeletedAt,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { Item } from 'src/inventory/items/models';
import { BaseModel } from 'src/shared/models/base.model';

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
}

export type PaymentStatusType = keyof typeof PaymentStatus;

@Table({
  tableName: 'sales',
  underscored: true,
})
export class Sale extends BaseModel {
  @ForeignKey(() => Item)
  @Column({ type: DataType.UUID, field: 'item_id' })
  itemId: string;

  @BelongsTo(() => Item, 'item_id')
  item: Item;

  @Column({ type: DataType.STRING, field: 'patient_name' })
  patientName: string;

  @Column({ type: DataType.STRING, field: 'sale_number' })
  saleNumber: string;

  @Column({ type: DataType.NUMBER, field: 'quantity' })
  quantity: number;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    field: 'status',
  })
  status: PaymentStatusType;

  @DeletedAt
  @Column({ type: DataType.DATE, field: 'deleted_at' })
  deletedAt: Date;

  @Column({ type: DataType.STRING, field: 'deleted_by' })
  deletedBy: string;
}
