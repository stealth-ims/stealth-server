import { Column, DataType, DeletedAt, Table } from 'sequelize-typescript';
import { BaseModel } from '../../shared/models/base.model';

@Table({
  tableName: 'users',
  underscored: true,
})
export class User extends BaseModel {
  @Column
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column
  phoneNumber: string;

  @Column
  facility: string;

  @Column
  department: string;

  @Column
  role: string;

  @Column
  password: string;

  @Column({ defaultValue: false })
  accountApproved: boolean;

  @Column({ defaultValue: 'ACTIVE' })
  status: string; //ACTIVE | DEACTIVATED

  @Column({ allowNull: true })
  deactivatedBy: string;

  @DeletedAt
  @Column({ type: DataType.DATE, field: 'deleted_at' })
  deletedAt: Date;

  @Column({ type: DataType.STRING, field: 'deleted_by' })
  deletedBy: string;
}
