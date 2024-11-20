import { PartialType, PickType } from '@nestjs/swagger';
import { ItemCategory } from '../models/items-category.model';

export class UpdateItemCategoryDto extends PartialType(
  PickType(ItemCategory, ['name']),
) {}
