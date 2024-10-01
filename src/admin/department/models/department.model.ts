import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from '../../../shared/models/base.model';
import { User } from '../../../auth/models/user.model';
// import { Drug } from '../../../inventory/drugs/models/drug.model';
import { Facility } from '../../facility/models/facility.model';

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

  @Column({ field: 'created_by', allowNull: true })
  createdBy: string;

  @Column({ field: 'updated_by', allowNull: true })
  updatedBy: string;

  // @ApiProperty({
  //   example: [],
  //   description: 'List of drugs available in the department',
  // })
  // @HasMany(() => Drug)
  // drugs: Drug[];
}
