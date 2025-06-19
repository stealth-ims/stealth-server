import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { Item } from 'src/inventory/items/models/item.model';
import { BaseModel } from 'src/core/shared/models/base.model';
import { Facility } from '../../../admin/facility/models/facility.model';

export enum ItemCategoryStatus {
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
}

@Table({
  tableName: 'item_categories',
  underscored: true,
  timestamps: true,
  paranoid: true,
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
  @IsOptional()
  status: ItemCategoryStatus;

  @ForeignKey(() => Facility)
  @Column
  facilityId: string;

  @BelongsTo(() => Facility)
  facility: Facility;

  @HasMany(() => Item)
  items: Item[];

  @ApiProperty({
    example: 100,
    description: 'Number of items under category',
  })
  @Column({
    type: DataType.VIRTUAL,
    get(this: ItemCategory) {
      return this.items && this.items.length ? this.items.length : 0;
    },
  })
  itemCount: number;
}
