import {
  AfterFind,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { Supplier } from 'src/inventory/suppliers/models/supplier.model';
import { BaseModel } from 'src/shared/models/base.model';
import { Item } from '.';
import { User } from '../../../auth/models/user.model';

@Table({
  tableName: 'batches',
  underscored: true,
  paranoid: true,
  timestamps: true,
})
export class Batch extends BaseModel {
  @ForeignKey(() => Item)
  @Column
  itemId: string;

  @BelongsTo(() => Item)
  item: Item;

  @Column({ type: DataType.DATE, allowNull: false })
  validity: Date;

  @Column
  batchNumber: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  quantity: number;

  @Column({ field: 'created_by', allowNull: true })
  createdBy: string;

  @ForeignKey(() => Supplier)
  @Column
  supplierId: string;

  @BelongsTo(() => Supplier)
  supplier: Supplier;

  @AfterFind
  static async addCreatedByUser(batches: Item | Item[]) {
    const records = Array.isArray(batches) ? batches : [batches];

    if (!records.length) return;

    const createdByNotExist = records.every((record) => !record.createdBy);
    if (createdByNotExist) return;

    const userIds = records.map((record) => record.createdBy);

    const users = await User.findAll({
      where: {
        id: userIds,
      },
      attributes: ['id', 'fullName', 'email'],
    });

    const userMap = new Map(users.map((user) => [user.id, user]));

    for (const record of records) {
      const user = userMap.get(record.createdBy) || null;

      record.createdBy = `${user.fullName},${user.id}`;
    }
  }
}
