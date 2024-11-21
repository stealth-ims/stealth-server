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
  tableName: 'item_categories',
  underscored: true,
})
export class ItemCategory extends BaseModel {
  @Column
  @ApiProperty({
    example: 'laxatives',
    description: 'item category name',
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
    description: 'item category status',
    enum: ItemCategoryStatus,
  })
  status: ItemCategoryStatus;

  @ApiProperty({
    example: 100,
    description: 'Number of items under category',
  })
  get itemCount(): number {
    return this.items?.length || 0;
  }

  @HasMany(() => Item)
  items: Item[];

  @AfterFind
  static async calculateItemCount(instance: ItemCategory[] | ItemCategory) {
    if (instance instanceof Array) {
      for (const inst of instance) {
        delete inst.dataValues.items;
      }
    }
  }
}
