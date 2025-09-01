import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  AfterBulkDestroy,
  AfterBulkUpdate,
  AfterCreate,
  AfterDestroy,
  AfterFind,
  AfterUpdate,
  AllowNull,
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
import { User } from '../../../auth/models/user.model';
import { deleteByPattern } from 'src/core/shared/modules/cache/utils/delete-prefix.util';

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
export class ItemCategory extends BaseModel<ItemCategory> {
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
  })
  itemCount: number;

  @AllowNull
  @ForeignKey(() => User)
  @Column
  createdById: string;

  @BelongsTo(() => User)
  createdBy: User;

  @AllowNull
  @ForeignKey(() => User)
  @Column
  updatedById: string;

  @BelongsTo(() => User)
  updatedBy: User;

  @AllowNull
  @ForeignKey(() => User)
  @Column
  deletedById: string;

  @BelongsTo(() => User)
  deletedBy: User;

  async getItemCount(): Promise<number> {
    const itemsCount = await Item.count({ where: { categoryId: this.id } });
    return itemsCount;
  }

  @AfterFind
  static async afterFindHook(
    this: void,
    categories: ItemCategory | ItemCategory[],
  ): Promise<void> {
    if (!categories) return;
    const processCategory = async (category: ItemCategory) => {
      if (!category) return;
      category.itemCount = await category.getItemCount();
    };
    if (Array.isArray(categories)) {
      await Promise.all(categories.map(processCategory));
    } else {
      await processCategory(categories);
    }
  }

  @AfterCreate
  @AfterUpdate
  @AfterDestroy
  @AfterBulkUpdate
  @AfterBulkDestroy
  static async handleMutation() {
    await deleteByPattern(process.env.REDIS_URL, '*item-categories*');
  }
}
