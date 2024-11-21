import { Column, HasMany, Table } from 'sequelize-typescript';
import { BaseModel } from 'src/shared/models/base.model';
import { User } from 'src/auth/models/user.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
// import { Item } from '../../../inventory/items/models/item.model';
import { Department } from '../../department/models/department.model';
import { StockAdjustment } from 'src/stock-adjustments/model/stock-adjustment.model';

@Table({
  tableName: 'facilities',
  underscored: true,
})
export class Facility extends BaseModel {
  @ApiProperty({
    example: 'Hospital A',
    description: 'The name of the hospital',
  })
  @IsString()
  @IsNotEmpty()
  @Column
  name: string;

  @ApiProperty({
    example: 'North',
    description: 'The region where the hospital is located',
  })
  @IsString()
  @IsNotEmpty()
  @Column
  region: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'The physical location of the hospital',
  })
  @Column
  location: string;

  @HasMany(() => Department)
  departments: Department[];

  @HasMany(() => User)
  workers: User[];

  @Column({ field: 'created_by', allowNull: true })
  createdBy: string;

  @Column({ field: 'updated_by', allowNull: true })
  updatedBy: string;

  @HasMany(() => StockAdjustment)
  stockAdjustments: StockAdjustment[];

  // @ApiProperty({
  //   example: [],
  //   description: 'List of items available in the hospital',
  // })
  // @HasMany(() => Item)
  // items: Item[];
}
