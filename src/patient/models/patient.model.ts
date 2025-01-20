import {
  AfterFind,
  AllowNull,
  Column,
  DataType,
  DeletedAt,
  HasMany,
  Table,
  Unique,
} from 'sequelize-typescript';
import { BaseModel } from '../../shared/models/base.model';
import { Sale } from '../../sales/models/sales.models';
import { User } from '../../auth/models/user.model';

@Table({
  tableName: 'patients',
  underscored: true,
})
export class Patient extends BaseModel {
  @Column
  name: string;

  @Unique
  @Column
  cardIdentificationNumber: string;

  @Column(DataType.DATE)
  dateOfBirth: Date;

  @Column
  createdBy: string;

  @DeletedAt
  @Column
  deletedAt: Date;

  @AllowNull
  @Column
  deletedBy: string;

  @HasMany(() => Sale)
  sales: Sale[];

  @AfterFind
  static async addCreatedByUser(patients: Patient | Patient[]) {
    const records = Array.isArray(patients) ? patients : [patients];

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
