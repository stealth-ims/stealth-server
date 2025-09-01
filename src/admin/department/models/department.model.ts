import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import {
  AfterBulkDestroy,
  AfterBulkUpdate,
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from '../../../core/shared/models/base.model';
import { User } from '../../../auth/models/user.model';
import { Facility } from '../../facility/models/facility.model';
import { DepartmentRequest } from 'src/department-requests/models/department-requests.model';
import { StockAdjustment } from 'src/inventory/models/stock-adjustment.model';
import { deleteByPattern } from 'src/core/shared/modules/cache/utils/delete-prefix.util';

@Table({
  tableName: 'departments',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class Department extends BaseModel<Department> {
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

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user who created the department',
  })
  @IsUUID()
  @ForeignKey(() => User)
  @Column
  createdById: string;

  @BelongsTo(() => User)
  createdBy: User;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'The ID of the user who last updated the department',
  })
  @IsUUID()
  @ForeignKey(() => User)
  @Column
  updatedById: string;

  @BelongsTo(() => User)
  updatedBy: User;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174002',
    description: 'The ID of the user who deleted the department',
  })
  @IsUUID()
  @ForeignKey(() => User)
  @Column
  deletedById: string;

  @BelongsTo(() => User)
  deletedBy: User;

  @AfterCreate
  @AfterUpdate
  @AfterDestroy
  @AfterBulkUpdate
  @AfterBulkDestroy
  static async handleMutation() {
    await deleteByPattern(process.env.REDIS_URL, 'departments*');
  }
}
