import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import {
  AfterFind,
  Column,
  DataType,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { Item } from 'src/inventory/items/models/item.model';
import { BaseModel } from 'src/shared/models/base.model';

export enum ItemCategoryStatus {
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
}

@Table({
  tableName: 'drug_categories',
  underscored: true,
})
export class ItemCategory extends BaseModel {
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
    example: ItemCategoryStatus.ACTIVE,
    description: 'drug category status',
    enum: ItemCategoryStatus,
  })
  status: ItemCategoryStatus;

  @ApiProperty({
    example: 100,
    description: 'Number of drugs under category',
  })
  get drugCount(): number {
    return this.drugs?.length || 0;
  }

  @HasMany(() => Item)
  drugs: Item[];

  @AfterFind
  static async calculateDrugCount(instance: ItemCategory[] | ItemCategory) {
    if (instance instanceof Array) {
      for (const inst of instance) {
        delete inst.dataValues.drugs;
      }
    }
  }
}
