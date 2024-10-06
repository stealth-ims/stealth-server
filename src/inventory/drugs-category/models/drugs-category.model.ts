import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import {
  AfterFind,
  Column,
  DataType,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { Drug } from 'src/inventory/drugs/models/drug.model';
import { BaseModel } from 'src/shared/models/base.model';

export enum DrugsCategoryStatus {
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
}

@Table({
  tableName: 'drug_categories',
  underscored: true,
})
export class DrugsCategory extends BaseModel {
  @Column
  @ApiProperty({
    example: 'laxatives',
    description: 'drug category name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Column({
    type: DataType.ENUM('ACTIVE', 'DEACTIVATED'),
    defaultValue: 'ACTIVE',
  })
  @ApiProperty({
    example: DrugsCategoryStatus.ACTIVE,
    description: 'drug category status',
    enum: DrugsCategoryStatus,
  })
  status: DrugsCategoryStatus;

  @ApiProperty({
    example: 100,
    description: 'Number of drugs under category',
  })
  get drugCount(): number {
    return this.drugs?.length || 0;
  }

  @HasMany(() => Drug)
  drugs: Drug[];

  @AfterFind
  static async calculateDrugCount(instance: DrugsCategory[] | DrugsCategory) {
    if (instance instanceof Array) {
      for (const inst of instance) {
        delete inst.dataValues.drugs;
      }
    }
  }
}
