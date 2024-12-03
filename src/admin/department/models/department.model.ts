import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from '../../../shared/models/base.model';
import { User } from '../../../auth/models/user.model';
// import { Item } from '../../../inventory/items/models/item.model';
import { Facility } from '../../facility/models/facility.model';
import { DepartmentRequest } from 'src/department-requests/models/department-requests.model';
import { StockAdjustment } from 'src/stock-adjustments/model/stock-adjustment.model';

@Table({
  tableName: 'departments',
  underscored: true,
})
export class Department extends BaseModel {
  @ApiProperty({
    example: 'Department A',
    description: 'The name of the department',
  })
  @IsString()
  @IsNotEmpty()
  @Column
  name: string;

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'The ID of the hospital to which the department belongs',
  })
  @IsUUID()
  @IsNotEmpty()
  @ForeignKey(() => Facility)
  @Column
  facilityId: string;

  @BelongsTo(() => Facility)
  facility: Facility;

  @HasMany(() => User)
  workers: User[];

  @HasMany(() => StockAdjustment)
  stockAdjustments: StockAdjustment[];
  @HasMany(() => DepartmentRequest)
  departmentRequests: DepartmentRequest[];

  @Column({ field: 'created_by', allowNull: true, type: DataType.JSON })
  createdBy: User;

  @Column({ field: 'updated_by', allowNull: true, type: DataType.JSON })
  updatedBy: User;
}
