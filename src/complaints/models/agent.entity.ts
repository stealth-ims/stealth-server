import { Column, Table } from 'sequelize-typescript';
import { BaseModel } from '../../core/shared/models/base.model';

@Table({
  tableName: 'customer_care_agents',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class CustomerCareAgent extends BaseModel {
  @Column
  name: string;

  @Column
  email: string;
}
