import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
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

  @ApiResponseProperty({
    example: {
      id: 'b7a3fb48-6b76-4998-9cd3-4de5b8a18837',
      name: 'Some Admin',
    },
  })
  @Column({ field: 'created_by', allowNull: true, type: DataType.JSON })
  createdBy: User;

  @ApiResponseProperty({
    example: null,
  })
  @Column({ field: 'updated_by', allowNull: true, type: DataType.JSON })
  updatedBy: User;
}
