import { Table } from 'sequelize-typescript';
import { BaseModel } from 'src/shared/models/base.model';

@Table({
  tableName: 'sales',
  underscored: true,
})
export class Sale extends BaseModel {}
