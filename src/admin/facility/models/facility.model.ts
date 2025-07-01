import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from 'src/core/shared/models/base.model';
import { User } from 'src/auth/models/user.model';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
// import { Item } from '../../../inventory/items/models/item.model';
import { Department } from '../../department/models/department.model';
import { StockAdjustment } from 'src/inventory/models/stock-adjustment.model';

@Table({
  tableName: 'facilities',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class Facility extends BaseModel<Facility> {
  @ApiProperty({
    example: 'Hospital A',
    description: 'The name of the hospital',
  })
  @IsString()
  @IsNotEmpty()
  @Column
  name: string;

  @AllowNull
  @Column
  email: string;

  @ApiProperty({
    example: '@kRhCnlAtrqe1gr',
    description: 'The password for the facility',
  })
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,!@#$^&*()_-])[a-zA-Z\d.,!@#$^&*()_-]{8,32}$/gm,
    {
      message:
        'Password must be between 8 and 32 characters long with at least 1 special character and an uppercase character',
    },
  )
  @Column
  password: string;

  @AllowNull
  @Column
  region: string;

  // @ApiProperty({
  //   example: '123 Main St',
  //   description: 'The physical location of the hospital',
  // })
  // @IsNotEmpty()
  @AllowNull
  @Column
  location: string;

  @HasMany(() => Department)
  departments: Department[];

  @HasMany(() => User)
  workers: User[];

  @HasMany(() => StockAdjustment)
  stockAdjustments: StockAdjustment[];

  // @ApiProperty({
  //   example: [],
  //   description: 'List of items available in the hospital',
  // })
  // @HasMany(() => Item)
  // items: Item[];

  @ForeignKey(() => User)
  @Column
  createdById: string;

  @BelongsTo(() => User)
  createdBy: User;

  @ForeignKey(() => User)
  @Column
  updatedById: string;

  @BelongsTo(() => User)
  updatedBy: User;

  @ForeignKey(() => User)
  @Column
  deletedById: string;

  @BelongsTo(() => User)
  deletedBy: User;
}
